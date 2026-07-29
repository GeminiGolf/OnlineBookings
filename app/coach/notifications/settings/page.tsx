"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Preferences = {
  late_booking: boolean;
  client_cancelled: boolean;
  double_booking: boolean;
  admin_message: boolean;
};

export default function CoachNotificationSettingsPage() {
  const [preferences, setPreferences] = useState<Preferences>({
    late_booking: true,
    client_cancelled: true,
    double_booking: true,
    admin_message: true,
  });

  useEffect(() => {
    async function loadPreferences() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: coach } = await supabase
        .from("coaches")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (!coach) return;

      const { data } = await supabase
        .from("coach_notification_preferences")
        .select(
          "late_booking, client_cancelled, double_booking, admin_message"
        )
        .eq("coach_id", coach.id)
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

    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!coach) {
      setPreferences(previous);
      alert("Coach not found.");
      return;
    }

    const { error } = await supabase
      .from("coach_notification_preferences")
      .upsert(
        {
          coach_id: coach.id,
          [key]: value,
        },
        {
          onConflict: "coach_id",
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
        href="/coach/notifications"
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
                Late Bookings
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                (Client books a slot that extends today by 2+ hours, or the earliest new slot of the next day)
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.late_booking}
              onChange={(e) =>
                updatePreference("late_booking", e.target.checked)
              }
              className="mt-1 h-5 w-5"
            />
          </div>
        </div>

        <div className="border-b p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-black">
                Client Cancellations
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                (Client cancels an appointment that changes today/tomorrow.)
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.client_cancelled}
              onChange={(e) =>
                updatePreference("client_cancelled", e.target.checked)
              }
              className="mt-1 h-5 w-5"
            />
          </div>
        </div>

        <div className="border-b p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-black">
                Double Bookings
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Receive a push notification when there's a scheduling conflict detected.
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.double_booking}
              onChange={(e) =>
                updatePreference("double_booking", e.target.checked)
              }
              className="mt-1 h-5 w-5"
            />
          </div>
        </div>

        <div className="border-b p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-black">
                Admin Messages
              </h2>
            </div>
            <input
              type="checkbox"
              checked={preferences.admin_message}
              onChange={(e) =>
                updatePreference("admin_message", e.target.checked)
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