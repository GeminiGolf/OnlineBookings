import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Bell, X } from "lucide-react"

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

      {/* Side Menu Drawer */}
      <div
        className={`fixed top-0 left-0 z-50 flex h-screen w-80 flex-col text-white shadow-2xl border-r border-[#D8CCB7]/15 transition-transform duration-300 ease-in-out ${
          isHomePage
            ? "bg-[#1B2E23]/95 backdrop-blur-xl"
            : "bg-[#1B2E23]"
        } ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button Header */}
        <div className="flex h-14 shrink-0 items-center justify-end px-6">
          <button
            onClick={toggleMenu}
            className="rounded-full p-1 text-[#E7DED1]/70 transition hover:bg-[#D8CCB7]/10 hover:text-white"
            aria-label="Close Menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Centered Stacked Logos */}
        <div className="flex shrink-0 flex-col items-center justify-center border-b border-[#D8CCB7]/10 px-6 pb-6 pt-2">
          <Image
            src="/images/logo-warm.png"
            alt="Logo Icon"
            width={48}
            height={48}
            className="mb-1 h-11 w-auto object-contain"
          />
          <Image
            src="/images/gemini-logo-text-warm.png"
            alt="Gemini Golf Academy"
            width={140}
            height={30}
            className="h-5 w-auto object-contain opacity-90"
          />
        </div>

        {/* Content Area */}
        <div className="px-6 py-4 space-y-2">
          <Link
            href="/"
            onClick={toggleMenu}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-light uppercase tracking-[0.18em] text-[#E7DED1] transition hover:bg-[#D8CCB7]/10 hover:text-white"
          >
            <span className="scale-x-95 origin-left">HOMEPAGE</span>
          </Link>

          <div className="pt-2 border-t border-[#D8CCB7]/10">
            <Link
              href="/coach/dashboard"
              onClick={toggleMenu}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-light uppercase tracking-[0.18em] text-[#E7DED1] transition hover:bg-[#D8CCB7]/10 hover:text-white"
            >
              <span className="scale-x-95 origin-left">
                {normalCount > 0 ? `DASHBOARD (${normalCount})` : "DASHBOARD"}
              </span>
            </Link>
          </div>

          <div className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-light uppercase tracking-[0.18em] text-[#E7DED1]/40 cursor-not-allowed">
            <span className="scale-x-95 origin-left">COMING SOON</span>
          </div>

          <div className="pt-2 border-t border-[#D8CCB7]/10 mt-2">
            <button
              onClick={() => {
                toggleMenu()
                handleLogout()
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-light uppercase tracking-[0.18em] text-[#E7786E] transition hover:bg-red-500/10 hover:text-red-300"
            >
              <span className="scale-x-95 origin-left">LOGOUT</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}