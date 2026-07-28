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
  console.log("🚨 PUSH ROUTE WAS CALLED 🚨");

  try {
    const { notificationId } = await req.json();

    console.log("notificationId:", notificationId);

    if (!notificationId) {
      console.log("❌ Missing notificationId");

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

    console.log("notification:", notification);
    let body: string;
    let preferenceColumn: string;

    switch (notification.type) {
      case "late_booking":
        body = "Late Booking Request";
        preferenceColumn = "late_booking";
        break;

      case "client_cancelled":
        body = "Client Cancelled";
        preferenceColumn = "client_cancelled";
        break;

      case "double_booking":
        body = "Double Booking Detected";
        preferenceColumn = "double_booking";
        break;

      case "admin_message_coach":
        body = notification.subject ?? "New Message";
        preferenceColumn = "admin_message";
        break;

      default:
        throw new Error(`Unknown notification type: ${notification.type}`);
    }

    console.log("[PUSH] Loading preferences...");

    const { data: preferences, error: preferencesError } = await supabase
      .from("coach_notification_preferences")
      .select("*")
      .eq("coach_id", notification.coach_id)
      .single();

    if (preferencesError) {
      throw preferencesError;
    }

    console.log("[PUSH] Preferences:", preferences);

    if (!preferences[preferenceColumn]) {
      return NextResponse.json({
        success: true,
        skipped: "Preference disabled",
      });
    }

    console.log("[PUSH] Loading coach...");

    const { data: coach, error: coachError } = await supabase
      .from("coaches")
      .select("profile_id")
      .eq("id", notification.coach_id)
      .single();

    if (coachError) {
      throw coachError;
    }

    console.log("[PUSH] Coach:", coach);

    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("profile_id", coach.profile_id);

    if (subscriptionsError) {
      throw subscriptionsError;
    }

    console.log("[PUSH] Subscriptions:", subscriptions);

    if (!subscriptions.length) {
      throw new Error("No subscriptions found.");
    }

    const payload = JSON.stringify({
      title: "Gemini Golf Academy",
      body,
      url: "/coach/notifications",
    });

    for (const subscription of subscriptions) {
      console.log("[PUSH] Sending...");

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

      console.log("[PUSH] Sent!");
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