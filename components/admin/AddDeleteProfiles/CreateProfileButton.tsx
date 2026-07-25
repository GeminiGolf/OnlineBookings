"use client"

import { useState } from "react"
import AddClient from "./AddClient"

export default function CreateProfileButton() {
  const [showMenu, setShowMenu] = useState(false)
  const [showClient, setShowClient] = useState(false)

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
              className="block w-full px-4 py-3 text-left text-gray-400"
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
    </>
  )
}