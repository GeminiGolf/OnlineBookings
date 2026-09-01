"use client"

import Link from "next/link"
import { Bell } from "lucide-react"

type Props = {
  urgentCount: number
  normalCount: number
  showUrgentDropdown: boolean
  setShowUrgentDropdown: (value: boolean) => void
  urgentNotifications: any[]
  handleApprove: (notificationId: number) => void
  handleReject: (
    notificationId: number,
    bookingId: number | null
  ) => void
  markNotificationRead: (notificationId: number) => void
  handleLogout: () => void
}

export default function AdminNavbar({
  urgentCount,
  normalCount,
  showUrgentDropdown,
  setShowUrgentDropdown,
  urgentNotifications,
  handleApprove,
  handleReject,
  markNotificationRead,
}: Props) {
  const totalCount = urgentCount + normalCount

  return (
    <>

      <Link
        href="/admin/schedule"
        className="text-[15px] font-light uppercase tracking-[0.15em] text-[#E7DED1] transition hover:text-white"
      >
        SCHEDULE
      </Link>

      {/* 1. DASH Link First */}
      <Link
        href="/admin"
        className="text-[15px] font-light uppercase tracking-[0.15em] text-[#E7DED1] transition hover:text-white"
      >
        <span className="inline-block">
          DASH {totalCount > 0 ? `(${totalCount})` : ""}
        </span>
      </Link>

      {/* 2. Notification Bell Second */}
      <div className="relative">
        <button
          onClick={() => setShowUrgentDropdown(!showUrgentDropdown)}
          className="relative flex items-center justify-center transition text-[#E7DED1] hover:text-white"
        >
          <Bell
            size={20}
            color={urgentNotifications.length > 0 ? "#8F3434" : "currentColor"}
          />
          {urgentNotifications.length > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#8F3434] text-[10px] font-bold text-white">
              {urgentNotifications.length}
            </span>
          )}
        </button>

        {showUrgentDropdown && (
          <div className="absolute -right-2 top-10 z-50 w-[calc(100vw-32px)] max-w-[420px] rounded-xl border bg-white p-3 shadow-xl">
            {urgentNotifications.length === 0 ? (
              <p className="text-[13px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
                No Urgent Notifications
              </p>
            ) : (
              <div className="space-y-3">
                {urgentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-lg border border-red-200 bg-red-50 p-3"
                  >
                    {notification.type === "double_booking" ? (
                      <>
                        <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#8F3434]">
                          DOUBLE BOOKING
                        </div>

                        <div className="mb-3 space-y-1 text-xs text-black">
                          {notification.message
                            .split("\n")
                            .map((line: string, index: number) => {
                              if (line.includes("|")) {
                                const [name, clientId] = line.split("|")

                                return (
                                  <Link
                                    key={index}
                                    href={`/admin/clients/${clientId}`}
                                    className="block font-medium text-blue-600 hover:underline"
                                  >
                                    {name}
                                  </Link>
                                )
                              }

                              return (
                                <p key={index} className="whitespace-pre-wrap">
                                  {line}
                                </p>
                              )
                            })}
                        </div>

                        <button
                          onClick={() => markNotificationRead(notification.id)}
                          className="rounded bg-[#2F5A43] px-3 py-1 text-xs uppercase text-white transition hover:bg-[#244634]"
                        >
                          Mark as Read
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="mb-2 text-[13px] font-semibold text-black">
                          Late Booking - {notification.client_name}
                        </div>

                        <div className="mb-3 text-xs text-gray-700">
                          {new Date(notification.lesson_date).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                            }
                          )}
                          {" @ "}
                          {notification.lesson_time
                            .replace(":00", "")
                            .toLowerCase()}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(notification.id)}
                            className="rounded bg-[#2F5A43] px-3 py-1 text-xs uppercase text-white transition hover:bg-[#244634]"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              handleReject(notification.id, notification.booking_id)
                            }
                            className="rounded bg-[#8F3434] px-3 py-1 text-xs uppercase text-white transition hover:bg-[#742A2A]"
                          >
                            Reject
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}