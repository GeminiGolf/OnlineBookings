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
  handleLogout,
}: Props) {
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
                {urgentNotifications.map((notification) => (
                  <div key={notification.id} className="rounded-lg border border-red-200 bg-red-50 p-3">
                    {notification.type === "double_booking" ? (
                      <>
                        <div className="mb-2 text-sm font-bold text-red-700">
                          DOUBLE BOOKING
                        </div>

                        <div className="mb-3 space-y-1 text-sm text-black">
                          {notification.message
                            .split("\n")
                            .map((line: string, index: number) => {
                            if (line.includes("|")) {
                              const [name, clientId] = line.split("|")

                              return (
                                <Link
                                  key={index}
                                  href={`/admin/clients/${clientId}`}
                                  className="block text-blue-600 hover:underline font-medium"
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
                          className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                        >
                          Mark as Read
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="mb-2 text-sm font-bold text-black">
                          Late Booking - {notification.client_name}
                        </div>

                        <div className="mb-3 text-xs text-gray-700">
                          {new Date(notification.lesson_date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                          {" @ "}
                          {notification.lesson_time.replace(":00", "").toLowerCase()}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(notification.id)}
                            className="rounded bg-green-600 px-3 py-1 text-sm text-white"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => handleReject(notification.id, notification.booking_id)}
                            className="rounded bg-red-600 px-3 py-1 text-sm text-white"
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

      <Link href="/admin/schedule" className="text-base transition hover:text-yellow-400">
        Schedule
      </Link>
      <Link href="/admin" className="text-base transition hover:text-green-400">
        {urgentCount + normalCount > 0 ? `Dash (${urgentCount + normalCount})` : "Dash"}
      </Link>
      <button onClick={handleLogout} className="text-base transition hover:text-red-400">
        Logout
      </button>
    </>
  )
}