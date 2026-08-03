"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import DashboardContainer from "@/components/layout/DashboardContainer"
type Preferences = {
  late_booking_rejected: boolean;
  appointment_reminder_hours: number[];
  admin_messages: boolean;
};

export default function CoachNotificationSettingsPage() {
  const SHOW_APPOINTMENT_REMINDERS = false;

  const [preferences, setPreferences] = useState<Preferences>({
    late_booking_rejected: true,
    appointment_reminder_hours: [12],
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
          "late_booking_rejected, appointment_reminder_hours, admin_messages"
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

  async function updateReminderHours(hours: number[]) {
    const previous = preferences;

    setPreferences((current) => ({
      ...current,
      appointment_reminder_hours: hours,
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
          appointment_reminder_hours: hours,
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

  function toggleReminder(hour: number) {
    const updated = preferences.appointment_reminder_hours.includes(hour)
      ? preferences.appointment_reminder_hours.filter((h) => h !== hour)
      : [...preferences.appointment_reminder_hours, hour].sort((a, b) => b - a);

    updateReminderHours(updated);
  }

  return (
    <main className="min-h-screen bg-[#F2EEE8] px-4 pt-8 pb-3 sm:p-10 text-[#1F3327]">
      <DashboardContainer>

        <Link
          href="/client/notifications"
          className="mb-3 inline-flex items-center gap-2 rounded-xl border border-[#3A5D49] bg-white px-5 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6] sm:mb-8"
        >
          <ArrowLeft className="h-4 w-4 stroke-[1.75]" />
          Back to Notifications
        </Link>

        <h1 className="dashboard-heading">
          Push Notification Settings
        </h1>

        <p className="mt-2 text-[14px] font-light text-[#2F5A43]">
          Choose which push notifications you'd like to receive on your devices.
        </p>

      <div className="max-w-3xl overflow-hidden rounded-3xl border border-[#3A5D49] bg-white shadow-md">

        <div className="border-b border-[#3A5D49] p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[19px] font-light tracking-[0.02em] text-[#2F5A43]">
                Coach Cancelled
              </h2>

              <p className="mt-2 text-[14px] font-light text-[#2F5A43]">
                Receive a push notification when your coach cancels an appointment.
              </p>
            </div>

            <input
              type="checkbox"
              checked={preferences.late_booking_rejected}
              onChange={(e) =>
                updatePreference("late_booking_rejected", e.target.checked)
              }
              className="mt-1 h-5 w-5 accent-[#2F5A43]"
            />
          </div>
        </div>

        {SHOW_APPOINTMENT_REMINDERS && (
          <div className="border-b border-[#3A5D49] p-4 sm:p-6">
            <h2 className="text-[19px] font-light tracking-[0.02em] text-[#2F5A43]">
              Appointment Reminders
            </h2>

            <p className="dashboard-value mt-2 mb-4 text-[14px] text-[#1F3327]">
              Choose when you'd like to receive reminders before your lesson.
            </p>

            <div className="space-y-3">

              {[24, 12, 6, 2].map((hour) => (
                <label
                  key={hour}
                  className="flex items-center justify-between rounded-xl border border-[#3A5D49] bg-[#FBF8F3] px-4 py-3 transition hover:bg-[#F6FAF6]"
                >
                  <span className="text-[#2F5A43] font-light">
                    {hour} hour{hour === 1 ? "" : "s"} before
                  </span>

                  <input
                    type="checkbox"
                    checked={preferences.appointment_reminder_hours.includes(hour)}
                    onChange={() => toggleReminder(hour)}
                    className="h-5 w-5 accent-[#2F5A43]"
                  />
                </label>
              ))}

            </div>
          </div>
        )}
      </div>
    </DashboardContainer>
  </main>
  );
}