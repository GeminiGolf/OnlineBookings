"use client"

import { Menu } from "lucide-react"
type Props = {
  open: boolean
  onClose: () => void
  handleLogout: () => void
  backgroundColor: string
}

export default function CoachDrawer({
  open,
  onClose,
  handleLogout,
  backgroundColor,
}: Props) {
  return (
    <aside
      className={`fixed right-0 top-0 z-[9998] h-screen w-[72vw] max-w-[320px] border-l transition-transform duration-300 ease-in-out ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      style={{
        backgroundColor,
        borderColor: "#223126",
      }}
    >
      {/* Close Button */}
      <div className="flex h-16 items-center justify-end px-6">
        <button
          onClick={onClose}
          className="relative -left-[2px] -top-[1px] rounded-md p-1 transition"
          style={{ color: "#D8CCB7" }}
          aria-label="Close menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Logos */}
      <div className="flex flex-col items-center border-b border-[#223126] px-6 pb-6 pt-3">
        <img
          src="/images/logo-warm.png"
          alt="Gemini Golf Academy"
          className="mb-1 h-10 w-auto"
        />

        <img
          src="/images/gemini-logo-text-warm.png"
          alt="Gemini Golf Academy"
          className="h-4 w-auto"
        />
      </div>

      {/* Menu */}
      <nav className="pt-8">
        <button
          disabled
          className="flex h-12 w-full items-center px-8 text-left text-xs font-light uppercase tracking-[0.15em] opacity-40"
          style={{ color: "#D8CCB7" }}
        >
          Coming Soon...
        </button>

        <button
          onClick={handleLogout}
          className="flex h-12 w-full items-center px-8 text-left text-xs font-light uppercase tracking-[0.15em] transition hover:bg-white/5"
          style={{
            color: "#D8CCB7",
            borderTop: "1px solid #223126",
          }}
        >
          Logout
        </button>
      </nav>
    </aside>
  )
}