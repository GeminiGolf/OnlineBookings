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

    // TODO: Replace columns if your schema differs.
    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", notificationId)
      .single();

    if (notificationError || !notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    let body: string | null = null;
    let preferenceColumn: string | null = null;

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
        return NextResponse.json({ success: true });
    }

    const { data: preferences } = await supabase
      .from("coach_notification_preferences")
      .select("*")
      .eq("coach_id", notification.coach_id)
      .maybeSingle();

    if (preferences && preferenceColumn && !preferences[preferenceColumn]) {
      return NextResponse.json({
        success: true,
        skipped: "Disabled by coach",
      });
    }

    const { data: coach } = await supabase
      .from("coaches")
      .select("profile_id")
      .eq("id", notification.coach_id)
      .single();

    if (!coach) {
      return NextResponse.json(
        { error: "Coach not found" },
        { status: 404 }
      );
    }

    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("profile_id", coach.profile_id);

    if (!subscriptions?.length) {
      return NextResponse.json({
        success: true,
        skipped: "No subscriptions",
      });
    }

    const payload = JSON.stringify({
      title: "Gemini Golf Academy",
      body,
      url: "/coach/notifications",
    });

    for (const subscription of subscriptions) {
      try {
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
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("id", subscription.id);
        } else {
          console.error(err);
        }
      }
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