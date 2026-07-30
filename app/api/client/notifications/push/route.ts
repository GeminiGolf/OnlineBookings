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

    if (notificationError) {
      throw notificationError;
    }

    let body: string;
    let preferenceColumn: string;

    switch (notification.type) {
      case "coach_cancelled":
      case "admin_cancelled":
        body = notification.message;
        preferenceColumn = "late_booking_rejected";
        break;

      case "appointment_reminder":
        body = notification.subject ?? "Lesson Reminder";
        preferenceColumn = "appointment_reminders";
        break;

      case "admin_message_client":
        body = notification.subject ?? "New Message";
        preferenceColumn = "admin_messages";
        break;

      default:
        throw new Error(`Unknown notification type: ${notification.type}`);
    }

    const { data: preferences, error: preferencesError } = await supabase
      .from("client_notification_preferences")
      .select("*")
      .eq("client_id", notification.client_id)
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

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("profile_id")
      .eq("id", notification.client_id)
      .single();

    if (clientError) {
      throw clientError;
    }

    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("profile_id", client.profile_id);

    if (subscriptionsError) {
      throw subscriptionsError;
    }

    if (!subscriptions.length) {
      throw new Error("No subscriptions found.");
    }

    const payload = JSON.stringify({
      title: "Gemini Golf Academy",
      body,
      url: "/client/notifications",
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