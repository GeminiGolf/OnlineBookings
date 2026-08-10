import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Bell, Menu } from "lucide-react"
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

export default function CoachNavbar({
  urgentCount,
  normalCount,
  showUrgentDropdown,
  setShowUrgentDropdown,
  urgentNotifications,
  handleApprove,
  handleReject,
  markNotificationRead,
  handleLogout,
}: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const pathname = usePathname()
  const drawerBackground =
    pathname === "/" ? "#08190F" : "#445244"
  const drawerWidth = "min(320px,72vw)"
  return (
  <div className="flex items-center gap-2 md:gap-4">
    <div className="relative">
      <button
        onClick={() => setShowUrgentDropdown(!showUrgentDropdown)}
        className="relative flex items-center justify-center transition"
        style={{ color: "#D8CCB7" }}
      >
        <>
          <Bell size={20} />
          {urgentCount > 0 && (
            <span
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: "#8F3434" }}
            >
              {urgentCount}
            </span>
          )}
        </>
      </button>

      {showUrgentDropdown && (
        <div className="absolute left-0 top-10 z-50 w-[420px] rounded-xl border bg-white p-3 shadow-xl">
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

    <Link
      href="/coach/dashboard"
      className="text-sm font-light uppercase tracking-[0.15em] transition"
      style={{ color: "#D8CCB7" }}
    >
      <span className="inline-block scale-x-90">
        <span className="inline sm:hidden">
          {normalCount > 0 ? `DASH (${normalCount})` : "DASH"}
        </span>

        <span className="hidden sm:inline">
          {normalCount > 0 ? `DASHBOARD (${normalCount})` : "DASHBOARD"}
        </span>
      </span>
    </Link>

    <button
      onClick={() => setShowMenu((v) => !v)}
      className="relative z-[10001] rounded-md p-1 transition"
      style={{ color: "#D8CCB7" }}
    >
      <Menu size={22} />
    </button>

    {showMenu && (
      <div
        className="fixed right-0 top-0 z-[10000] h-screen"
        style={{
          width: drawerWidth,
          background: drawerBackground,
          borderLeft: "1px solid #223126",
          paddingTop: "64px",
        }}
      >
        <button
          onClick={() => setShowMenu((v) => !v)}
          className="absolute right-6 top-3 z-[10002] rounded-md p-1 transition"
          style={{ color: "#D8CCB7" }}
        >
          <Menu size={22} />
        </button>

        <div className="flex flex-col items-center border-b border-[#223126] py-6">
          <img
            src="/images/logo-warm.png"
            className="h-10 w-auto"
            alt=""
          />

          <img
            src="/images/gemini-logo-text-warm.png"
            className="mt-1 h-4 w-auto"
            alt=""
          />
        </div>

        <nav className="pt-8">
          <button
            disabled
            className="flex h-12 w-full items-center px-8 text-left text-xs font-light uppercase tracking-[0.15em]"
            style={{
              color: "#D8CCB7",
              opacity: 0.45,
            }}
          >
            Coming Soon...
          </button>

          <button
            onClick={handleLogout}
            className="flex h-12 w-full items-center border-t border-[#223126] px-8 text-left text-xs font-light uppercase tracking-[0.15em]"
            style={{ color: "#D8CCB7" }}
          >
            Logout
          </button>
        </nav>
      </div>
    )}

  </div>
  )
}