"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"

type Props = {
  clientNotificationCount: number
  handleLogout: () => void
  isMenuOpen: boolean
  toggleMenu: () => void
}

export default function ClientNavbar({
  clientNotificationCount,
}: Props) {
  return (
    <>
      {/* 1. DASHBOARD Link First */}
      <Link
        href="/client/dashboard"
        className="text-[15px] font-light uppercase tracking-[0.15em] text-[#E7DED1] transition hover:text-white"
      >
        <span className="inline-block">DASHBOARD</span>
      </Link>

      {/* 2. Bell Notification Icon Second (To the Right of Dashboard) */}
      <Link
        href="/client/notifications"
        className="relative flex items-center justify-center transition text-[#E7DED1] hover:text-white"
      >
        <Bell
          size={20}
          color={clientNotificationCount > 0 ? "#8F3434" : "currentColor"}
        />
        {clientNotificationCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#8F3434] text-[10px] font-bold text-white">
            {clientNotificationCount}
          </span>
        )}
      </Link>
    </>
  )
}