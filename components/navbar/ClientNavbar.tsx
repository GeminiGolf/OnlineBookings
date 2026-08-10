import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Bell, X } from "lucide-react"

type Props = {
  clientNotificationCount: number
  handleLogout: () => void
  isMenuOpen: boolean
  toggleMenu: () => void
}

export default function ClientNavbar({
  clientNotificationCount,
  handleLogout,
  isMenuOpen,
  toggleMenu,
}: Props) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

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
              href="/client/dashboard"
              onClick={toggleMenu}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-light uppercase tracking-[0.18em] text-[#E7DED1] transition hover:bg-[#D8CCB7]/10 hover:text-white"
            >
              <span className="scale-x-95 origin-left">DASHBOARD</span>
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