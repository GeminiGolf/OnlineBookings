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

    // Fetch the notification details
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

    let title: string;
    let body: string;

    // Fetch client details for context
    const { data: client } = await supabase
      .from("clients")
      .select("preferred_name, first_name, last_name")
      .eq("id", notification.client_id)
      .maybeSingle();

    const clientName = client
      ? [
          client.preferred_name ? `(${client.preferred_name})` : null,
          client.first_name,
          client.last_name,
        ]
          .filter(Boolean)
          .join(" ")
      : "Client";

    // Handle allowed admin notification types: late_booking, client_cancelled, double_booking
    switch (notification.type) {
      case "late_booking":
        title = "Late Booking Request";
        body = clientName;
        break;

      case "client_cancelled":
        title = "Cancelled Lesson";
        body = `${clientName} cancelled.`;
        break;

      case "double_booking":
        title = "Double Booking Detected";
        body = "Please review the schedule.";
        break;

      default:
        // Ignore other notification types meant only for coaches
        return NextResponse.json({
          success: true,
          skipped: `Admin does not subscribe to ${notification.type}`,
        });
    }

    // Find the single admin profile
    const { data: adminProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .single();

    if (profileError || !adminProfile) {
      throw new Error("Admin profile not found.");
    }

    // Get all push subscriptions active for the admin profile
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("profile_id", adminProfile.id);

    if (subscriptionsError) {
      throw subscriptionsError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        skipped: "No push subscriptions found for admin.",
      });
    }

    const payload = JSON.stringify({
      title,
      body,
      url: "/admin/notifications",
    });

    // Send notifications to all admin devices
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
      } catch (pushErr) {
        console.error("Failed to send push to standard endpoint:", pushErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin Push Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}