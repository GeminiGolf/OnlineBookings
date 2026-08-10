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
  isMenuOpen: boolean
  toggleMenu: () => void
}

export default function CoachNavbar({
  showUrgentDropdown,
  setShowUrgentDropdown,
  urgentNotifications,
  handleApprove,
  handleReject,
  markNotificationRead,
}: Props) {
  return (
    <>
      {/* 1. SCHEDULE Link First */}
      <Link
        href="/coach/schedule"
        className="text-[15px] font-light uppercase tracking-[0.15em] text-[#E7DED1] transition hover:text-white"
      >
        <span className="inline-block">SCHEDULE</span>
      </Link>

      {/* 2. Bell Notification Icon Second (To the Right of Schedule) */}
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
                {urgentNotifications.map((notification: any) => (
                  <div key={notification.id} className="rounded-lg border border-red-200 bg-red-50 p-3">
                    {notification.type === "double_booking" ? (
                      <>
                        {(() => {
                          const lines = notification.message
                            .split("\n")
                            .filter((line: string) => line.trim() !== "")

                          const date =
                            lines.find((l: string) => l.startsWith("Date:"))?.replace("Date:", "").trim() ?? ""
                          const time =
                            lines.find((l: string) => l.startsWith("Time:"))?.replace("Time:", "").trim() ?? ""
                          const clients = lines.filter((l: string) => l.includes("|"))

                          return (
                            <div className="space-y-2">
                              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#8F3434]">
                                DOUBLE BOOKING
                              </p>

                              <p className="text-[13px] uppercase tracking-[0.12em] text-[#2F5A43]">
                                <span className="font-light">
                                  LESSON :
                                </span>{" "}
                                <span className="font-semibold">
                                  {new Date(date).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "2-digit",
                                  })}
                                  {" - "}
                                  {time.replace(":00", "")}
                                </span>
                              </p>

                              {clients.map((client: string, index: number) => {
                                const [name, clientId] = client.split("|")

                                return (
                                  <Link
                                    key={index}
                                    href={`/coach/clients/${clientId}`}
                                    className="block w-fit text-[13px] font-semibold text-[#5874A6] underline underline-offset-2 transition hover:text-[#45628F]"
                                  >
                                    {name}
                                  </Link>
                                )
                              })}

                              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#2F5A43]">
                                CONTACT YOUR CLIENTS IMMEDIATELY.
                              </p>

                              <button
                                onClick={() => markNotificationRead(notification.id)}
                                className="rounded bg-[#2F5A43] px-4 py-1.5 text-[13px] font-light uppercase tracking-[0.12em] text-white transition hover:bg-[#244634]"
                              >
                                Mark as Done
                              </button>
                            </div>
                          )
                        })()}
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#8F3434]">
                            LATE BOOKING
                          </p>

                          <Link
                            href={`/coach/clients/${notification.client_id}`}
                            className="block w-fit text-[13px] font-semibold text-[#5874A6] underline underline-offset-2 transition hover:text-[#45628F]"
                          >
                            {notification.client_name}
                          </Link>

                          <p className="text-[13px] uppercase tracking-[0.12em] text-[#2F5A43]">
                            <span className="font-light">
                              LESSON :
                            </span>{" "}
                            <span className="font-semibold">
                              {new Date(notification.lesson_date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                              })}
                              {" - "}
                              {notification.lesson_time.replace(":00", "").toLowerCase()}
                            </span>
                          </p>

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleApprove(notification.id)}
                              className="rounded bg-[#2F5A43] px-4 py-1.5 text-[13px] font-light uppercase tracking-[0.12em] text-white transition hover:bg-[#244634]"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => handleReject(notification.id, notification.booking_id)}
                              className="rounded bg-[#8F3434] px-4 py-1.5 text-[13px] font-light uppercase tracking-[0.12em] text-white transition hover:bg-[#742A2A]"
                            >
                              Reject
                            </button>
                          </div>
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