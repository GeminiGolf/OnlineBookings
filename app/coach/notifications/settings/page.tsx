"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CoachNotificationSettingsPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl p-8">
      <Link
        href="/coach/notifications"
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-black bg-white px-4 py-2 text-black hover:bg-gray-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Notifications
      </Link>

      <h1 className="text-3xl font-bold text-black">
        Push Notification Settings
      </h1>

      <p className="mt-2 mb-8 text-gray-600">
        Choose which push notifications you'd like to receive on your devices.
      </p>

      <div className="max-w-3xl rounded-xl bg-white shadow">
        <div className="border-b p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-black">
                Late Bookings
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Receive a push notification when a client books within 24 hours.
              </p>
            </div>
            <input type="checkbox" defaultChecked className="mt-1 h-5 w-5" />
          </div>
        </div>

        <div className="border-b p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-black">
                Client Cancellations
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Receive a push notification when a client cancels a lesson.
              </p>
            </div>
            <input type="checkbox" defaultChecked className="mt-1 h-5 w-5" />
          </div>
        </div>

        <div className="border-b p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-black">
                Double Bookings
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Receive a push notification when a scheduling conflict is detected.
              </p>
            </div>
            <input type="checkbox" defaultChecked className="mt-1 h-5 w-5" />
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-black">
                Admin Messages
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Receive push notifications sent by Gemini Golf Academy.
              </p>
            </div>
            <input type="checkbox" defaultChecked className="mt-1 h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  </main>
  );
}