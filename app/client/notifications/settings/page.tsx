"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Preferences = {
  late_booking_rejected: boolean;
  appointment_reminders: boolean;
  admin_messages: boolean;
};

export default function CoachNotificationSettingsPage() {
  const [preferences, setPreferences] = useState<Preferences>({
    late_booking_rejected: true,
    appointment_reminders: true,
    admin_messages: true,
  });

  useEffect(() => {
    async function loadPreferences() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (!client) return;

      const { data } = await supabase
        .from("client_notification_preferences")
        .select(
          "late_booking_rejected, appointment_reminders, admin_messages"
        )
        .eq("client_id", client.id)
        .maybeSingle();

      if (data) {
        setPreferences(data);
      }
    }
    loadPreferences();
  }, []);

  async function updatePreference(
    key: keyof Preferences,
    value: boolean
  ) {
    const previous = preferences;

    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: client } = await supabase
      .from("clients")
      .select("id, name")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!client) {
      setPreferences(previous);
      alert("Client not found.");
      return;
    }

    const { error } = await supabase
      .from("client_notification_preferences")
      .upsert(
        {
          client_id: client.id,
          name: client.name,
          [key]: value,
        },
        {
          onConflict: "client_id",
        }
      );

    if (error) {
      setPreferences(previous);
      alert("Could not save notification settings.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl p-8">
      <Link
        href="/client/notifications"
        className="mt-0 mb-4 inline-flex items-center gap-2 rounded-lg border border-black bg-white px-4 py-2 text-black hover:bg-gray-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Notifications
      </Link>

      <h1 className="text-2xl font-bold text-black sm:text-2xl">
        Push Notification Settings
      </h1>

      <p className="mt-1 mb-4 text-gray-600">
        Choose which push notifications you'd like to receive on your devices.
      </p>

      <div className="max-w-3xl rounded-xl bg-white shadow">

        <div className="border-b p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-black">
                Coach Cancelled
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Receive a push notification when your coach cancels an appointment.
              </p>
            </div>

            <input
              type="checkbox"
              checked={preferences.late_booking_rejected}
              onChange={(e) =>
                updatePreference("late_booking_rejected", e.target.checked)
              }
              className="mt-1 h-5 w-5"
            />
          </div>
        </div>

        <div className="border-b p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-black">
                Appointment Reminders
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Receive a reminder before your upcoming lesson.
              </p>
            </div>

            <input
              type="checkbox"
              checked={preferences.appointment_reminders}
              onChange={(e) =>
                updatePreference("appointment_reminders", e.target.checked)
              }
              className="mt-1 h-5 w-5"
            />
          </div>
        </div>


      </div>
    </div>
  </main>
  );
}