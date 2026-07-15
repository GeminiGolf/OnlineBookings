"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

type Props = {
  children: React.ReactNode
}

export default function RequireClient({ children }: Props) {
  const router = useRouter()
  const [authorised, setAuthorised] = useState(false)

  useEffect(() => {
    async function checkAccess() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace("/login")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (!profile || profile.role !== "client") {
        await supabase.auth.signOut()
        router.replace("/login")
        return
      }

      setAuthorised(true)
    }

    checkAccess()
  }, [router])

  if (!authorised) {
    return null
  }

  return <>{children}</>
}