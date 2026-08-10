import Link from "next/link"
import { useState } from "react"
import { Bell, Menu } from "lucide-react"

type Props = {
  clientNotificationCount: number
  handleLogout: () => void
}

export default function ClientNavbar({
  clientNotificationCount,
  handleLogout,
}: Props) {
  const [showMenu, setShowMenu] = useState(false)
  return (
    <div className="flex items-center gap-3 md:gap-4">
      <Link
        href="/client/notifications"
        className="relative flex items-center justify-center transition"
        style={{ color: "#D8CCB7" }}
      >
        <Bell size={20} />
        {clientNotificationCount > 0 && (
          <span
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: "#8F3434" }}
          >
            {clientNotificationCount}
          </span>
        )}
      </Link>

      <Link
        href="/client/dashboard"
        className="text-sm font-light uppercase tracking-[0.15em] transition"
        style={{ color: "#D8CCB7" }}
      >
        <span className="inline-block scale-x-90">
          DASHBOARD
        </span>
      </Link>

      <div className="relative z-[9999]">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="rounded-md p-1 transition"
          style={{ color: "#D8CCB7" }}
        >
          <Menu size={22} />
        </button>

        {showMenu && (
          <div
            className="absolute right-0 top-full z-[9999] mt-1 w-44 overflow-hidden rounded-b-md border border-[#6B7468] shadow-xl"
            style={{
              backgroundColor: "#445244",
            }}
          >
            <div className="border-b border-[#6B7468] px-4 py-2.5">
              <span className="text-[10px] font-light uppercase tracking-[0.22em] text-[#D8CCB7]/55">
                Coming Soon...
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-left text-[13px] font-light uppercase tracking-[0.18em] text-[#D8CCB7] transition-colors hover:bg-[#50604F]"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}