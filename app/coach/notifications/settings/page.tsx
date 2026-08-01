"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import DashboardContainer from "@/components/layout/DashboardContainer"

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
    <main className="min-h-screen bg-[#F2EEE8] px-4 pt-8 pb-3 sm:p-10 text-[#1F3327]">
      <DashboardContainer>
      <Link
        href="/coach/notifications"
        className="mb-3 sm:mb-6 inline-flex items-center gap-2 rounded-xl border border-[#3A5D49] bg-white px-5 py-2 text-[13px] font-light tracking-[0.04em] text-[#1F3327] shadow-sm transition hover:bg-[#F6FAF6]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Notifications
      </Link>

      <h1 className="text-[18px] sm:text-[22px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
        Push Notification Settings
      </h1>

      <p className="mt-2 mb-6 text-[15px] font-light tracking-[0.02em] text-[#1F3327]">
        Choose which push notifications you'd like to receive on your devices.
      </p>

      <div className="max-w-3xl rounded-3xl border border-[#3A5D49] bg-white shadow-md">
        <div className="border-b border-[#3A5D49] p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[18px] sm:text-[20px] font-light tracking-[0.02em] text-[#2F5A43]">
                Late Bookings
              </h2>
              <p className="mt-2 text-[15px] font-light tracking-[0.02em] text-[#1F3327]">
                (Client books a slot that extends today by 2+ hours, or the earliest new slot of the next day)
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.late_booking}
              onChange={(e) =>
                updatePreference("late_booking", e.target.checked)
              }
              className="mt-1 h-5 w-5 accent-[#2F5A43]"
            />
          </div>
        </div>

        <div className="border-b border-[#3A5D49] p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[18px] sm:text-[20px] font-light tracking-[0.02em] text-[#2F5A43]">
                Client Cancellations
              </h2>
              <p className="mt-2 text-[15px] font-light tracking-[0.02em] text-[#1F3327]">
                (Client cancels an appointment that changes today/tomorrow.)
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.client_cancelled}
              onChange={(e) =>
                updatePreference("client_cancelled", e.target.checked)
              }
              className="mt-1 h-5 w-5 accent-[#2F5A43]"
            />
          </div>
        </div>

        <div className="border-b border-[#3A5D49] p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[18px] sm:text-[20px] font-light tracking-[0.02em] text-[#2F5A43]">
                Double Bookings
              </h2>
              <p className="mt-2 text-[15px] font-light tracking-[0.02em] text-[#1F3327]">
                Receive a push notification when there's a scheduling conflict detected.
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.double_booking}
              onChange={(e) =>
                updatePreference("double_booking", e.target.checked)
              }
              className="mt-1 h-5 w-5 accent-[#2F5A43]"
            />
          </div>
        </div>

        <div className="border-b last:border-b-0 border-[#3A5D49] p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[18px] sm:text-[20px] font-light tracking-[0.02em] text-[#2F5A43]">
                Admin Messages
              </h2>
            </div>
            <input
              type="checkbox"
              checked={preferences.admin_message}
              onChange={(e) =>
                updatePreference("admin_message", e.target.checked)
              }
              className="mt-1 h-5 w-5 accent-[#2F5A43]"
            />
          </div>
        </div>
      </div>
    </DashboardContainer>
  </main>
  );
}