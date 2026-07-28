"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function SessionTimeout() {
  useEffect(() => {
    // Initialize the auth listener so Supabase keeps the session refreshed.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {})

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return null
}