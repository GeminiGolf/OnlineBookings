"use client"

import { useState } from "react"
import AddClient from "./AddClient"
import AddCoach from "./AddCoach"

export default function CreateProfileButton() {
  const [showMenu, setShowMenu] = useState(false)
  const [showClient, setShowClient] = useState(false)
  const [showCoach, setShowCoach] = useState(false)

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="rounded-xl bg-[#4E6FA8] px-4 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-white transition hover:bg-[#3F5F93]"
        >
          Create
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-44 rounded-lg border bg-white shadow-lg">
            <button
              onClick={() => {
                setShowMenu(false)
                setShowClient(true)
              }}
              className="block w-full px-4 py-3 text-left hover:bg-gray-100"
            >
              Client
            </button>

            <button
              onClick={() => {
                setShowMenu(false)
                setShowCoach(true)
              }}
              className="block w-full px-4 py-3 text-left hover:bg-gray-100"
            >
              Coach
            </button>
          </div>
        )}
      </div>

      {showClient && (
        <AddClient
          open={showClient}
          onClose={() => setShowClient(false)}
        />
      )}

      {showCoach && (
        <AddCoach
          open={showCoach}
          onClose={() => setShowCoach(false)}
        />
      )}
    </>
  )
}