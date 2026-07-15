"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function SessionTimeout() {
  const router = useRouter()

  useEffect(() => {
    async function checkExpiry() {
      const expiry = localStorage.getItem("loginExpiry")

      if (!expiry || expiry === "never") {
        return
      }

      if (Date.now() > Number(expiry)) {
        await supabase.auth.signOut()
        localStorage.removeItem("loginExpiry")
        router.replace("/login")
      }
    }

    checkExpiry()

    const interval = setInterval(checkExpiry, 60_000)

    return () => clearInterval(interval)
  }, [router])

  return null
}