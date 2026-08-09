import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webpush.setVapidDetails(
  "mailto:admin@geminigolfacademy.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {

  try {
    const { notificationId } = await req.json();


    if (!notificationId) {

      return NextResponse.json(
        { error: "Missing notificationId" },
        { status: 400 }
      );
    }

    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", notificationId)
      .single();

    let title: string;
    let body: string;
    let preferenceColumn: string;

    const { data: client } = await supabase
      .from("clients")
      .select("preferred_name, first_name, last_name")
      .eq("id", notification.client_id)
      .single();

    const clientName = client
      ? [
          client.preferred_name
            ? `(${client.preferred_name})`
            : null,
          client.first_name,
          client.last_name,
        ]
          .filter(Boolean)
          .join(" ")
      : "Client";

    switch (notification.type) {
      case "late_booking":
        title = "Late Booking Request";
        body = clientName;
        preferenceColumn = "late_booking";
        break;

      case "client_cancelled":
        title = "Cancelled Lesson";
        body = `${clientName} cancelled.`;
        preferenceColumn = "client_cancelled";
        break;

      case "double_booking":
        title = "Double Booking Detected";
        body = "Please review the schedule.";
        preferenceColumn = "double_booking";
        break;

      case "admin_message_coach":
        title = "Message from Admin";
        body = notification.subject ?? "New Message";
        preferenceColumn = "admin_message";
        break;

      default:
        throw new Error(`Unknown notification type: ${notification.type}`);
    }

    const { data: preferences, error: preferencesError } = await supabase
      .from("coach_notification_preferences")
      .select("*")
      .eq("coach_id", notification.coach_id)
      .maybeSingle();

    if (preferencesError) {
      throw preferencesError;
    }

    if (preferences && !preferences[preferenceColumn]) {
      return NextResponse.json({
        success: true,
        skipped: "Preference disabled",
      });
    }

    const { data: coach, error: coachError } = await supabase
      .from("coaches")
      .select("profile_id")
      .eq("id", notification.coach_id)
      .single();

    if (coachError) {
      throw coachError;
    }

    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("profile_id", coach.profile_id);

    if (subscriptionsError) {
      throw subscriptionsError;
    }

    if (!subscriptions.length) {
      throw new Error("No subscriptions found.");
    }

    const payload = JSON.stringify({
      title,
      body,
      url: "/coach/notifications",
    });

    for (const subscription of subscriptions) {

      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        payload
      );

    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}