import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Menu, X } from "lucide-react"

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
  urgentCount,
  normalCount,
  showUrgentDropdown,
  setShowUrgentDropdown,
  urgentNotifications,
  handleApprove,
  handleReject,
  markNotificationRead,
  handleLogout,
  isMenuOpen,
  toggleMenu,
}: Props) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  return (
  <>
    <div className="relative">
      <button
        onClick={() => setShowUrgentDropdown(!showUrgentDropdown)}
        className={`relative flex items-center justify-center transition ${
          urgentCount > 0 ? "font-bold text-red-500" : "hover:text-red-400"
        }`}
      >
        <>
          <Bell size={20} />
          {urgentCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
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
      href="/coach/schedule"
      className="text-sm font-light uppercase tracking-[0.15em] text-white/80 transition hover:text-white"
    >
      <span className="inline-block scale-x-90">SCHEDULE</span>
    </Link>
    <Link
      href="/coach/dashboard"
      className="text-sm font-light uppercase tracking-[0.15em] text-white/80 transition hover:text-white"
    >
      <span className="inline-block scale-x-90">
        <span className="inline-block scale-x-90">
          {normalCount > 0 ? `DASHBOARD (${normalCount})` : "DASHBOARD"}
        </span>
      </span>
    </Link>
    <button
      onClick={toggleMenu}
      className={`flex items-center justify-center p-1 text-white/80 transition hover:text-white ${
        isMenuOpen ? "hidden md:hidden" : "flex"
      }`}
      aria-label="Toggle Menu"
    >
      {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
    </button>

    {/* Side Menu Drawer */}
    <div
      className={`fixed top-0 right-0 z-50 h-screen w-80 text-white shadow-2xl transition-transform duration-300 ease-in-out ${
        isHomePage
          ? "bg-[#2F4538]/90 backdrop-blur-md"
          : "bg-[#2F4538]"
      } ${
        isMenuOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-[#D8CCB7]/10 px-6 py-4">
        <span className="text-xs font-light uppercase tracking-[0.2em] text-[#E7DED1]">MENU</span>
        <button
          onClick={toggleMenu}
          className="text-white/80 transition hover:text-white"
          aria-label="Close Menu"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex flex-col p-6 space-y-4">
        <button
          onClick={() => {
            toggleMenu()
            handleLogout()
          }}
          className="flex w-full items-center justify-start text-left text-sm font-light uppercase tracking-[0.15em] text-red-400 transition hover:text-red-300 py-2 border-b border-[#D8CCB7]/10"
        >
          <span className="inline-block scale-x-90">LOGOUT</span>
        </button>
      </div>
    </div>
    </>
  )
}