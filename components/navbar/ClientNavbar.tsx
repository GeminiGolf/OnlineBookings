import Link from "next/link"
import { Bell } from "lucide-react"

type Props = {
  clientNotificationCount: number
  handleLogout: () => void
}

export default function ClientNavbar({
  clientNotificationCount,
  handleLogout,
}: Props) {
  return (
    <>
      <Link
        href="/client/notifications"
        className="relative flex items-center justify-center text-base transition hover:text-blue-400"
      >
        <Bell size={20} />
        {clientNotificationCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
            {clientNotificationCount}
          </span>
        )}
      </Link>

      <Link
        href="/client/dashboard"
        className="text-sm font-light uppercase tracking-[0.15em] text-white/80 transition hover:text-white"
      >
        <span className="inline-block scale-x-90">
          DASHBOARD
        </span>
      </Link>

      <button
        onClick={handleLogout}
        className="text-sm font-light uppercase tracking-[0.15em] text-white/80 transition hover:text-white"
      >
        <span className="inline-block scale-x-90">
          LOGOUT
        </span>
      </button>
    </>
  )
}