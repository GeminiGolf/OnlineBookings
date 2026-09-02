"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"

export default function PaymentPage() {
  const [loading, setLoading] = useState(true)
  const [isAllowedClient, setIsAllowedClient] = useState(false)

  useEffect(() => {
    async function checkUserRole() {
      setLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setIsAllowedClient(false)
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (profile?.role === "client") {
        setIsAllowedClient(true)
      } else {
        setIsAllowedClient(false)
      }

      setLoading(false)
    }

    checkUserRole()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F1EA] text-[#2F5A43]">
        <p className="text-xs font-light uppercase tracking-[0.2em] opacity-70">
          Loading...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] px-4 py-16 text-[#2F5A43] md:px-6 md:py-24">
      <main className="mx-auto w-full max-w-xl">
        {!isAllowedClient ? (
          /* Restricted access message for logged-out users or non-client roles */
          <section className="overflow-hidden rounded-3xl border border-[#E2DDD3] bg-[#FAF8F5] p-8 text-center shadow-md md:p-10">
            <span className="text-xs font-light uppercase tracking-[0.2em] text-[#B89868]">
              Access Restricted
            </span>
            <h1 className="mt-2 text-xl font-light uppercase tracking-[0.14em] text-[#2F5A43] md:text-2xl">
              Client Account Required
            </h1>
            <p className="mt-4 text-xs font-light leading-relaxed tracking-[0.04em] text-[#2F5A43]/80 md:text-sm">
              Please log in as a client to view this page.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-[#B89868]/80 bg-[#2F5A43] px-6 py-3 text-xs font-semibold uppercase tracking-[0.17em] text-[#F2EEE8] shadow-md transition-all hover:bg-[#234533]"
              >
                Log In Here →
              </Link>
            </div>
          </section>
        ) : (
          /* Payment details card for authorized clients */
          <section className="overflow-hidden rounded-3xl border border-[#E2DDD3] bg-[#FAF8F5] p-6 shadow-md md:p-8">
            <div className="text-center">
              <span className="text-xs font-light uppercase tracking-[0.25em] text-[#B89868]">
                Payment Instructions
              </span>
              <h1 className="mt-1 text-xl font-light uppercase tracking-[0.18em] text-[#2F5A43] md:text-2xl">
                Scan & Transfer
              </h1>
            </div>

            {/* QR Code Container */}
            <div className="mt-6 flex justify-center">
              <div className="relative overflow-hidden rounded-2xl border border-[#E2DDD3] bg-white p-4 shadow-sm">
                <Image
                  src="/images/GGA_QR.jpeg"
                  alt="Gemini Golf Academy QR Code"
                  width={240}
                  height={240}
                  className="h-auto w-56 object-contain md:w-64"
                  priority
                />
              </div>
            </div>

            {/* Bank Transfer Details */}
            <div className="mt-6 rounded-2xl border border-[#E2DDD3]/60 bg-[#F4F1EA]/60 p-5 text-center">
              <span className="text-[11px] font-light uppercase tracking-[0.2em] text-[#B89868]">
                Direct Bank Transfer
              </span>
              <div className="mt-2 space-y-1">
                <p className="text-sm font-medium uppercase tracking-[0.12em] text-[#2F5A43]">
                  Gemini Golf SDN BHD
                </p>
                <p className="text-sm font-medium uppercase tracking-[0.12em] text-[#2F5A43]">
                  8011373062
                </p>
                <p className="text-sm font-medium uppercase tracking-[0.12em] text-[#2F5A43]">
                  CIMB
                </p>
              </div>
            </div>

            {/* Receipt Notice */}
            <p className="mt-6 text-center text-xs font-light leading-relaxed tracking-[0.04em] text-[#2F5A43]">
              Kindly send your receipt to admin: <br />
              <a
                href="https://wa.me/60173576747"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium tracking-[0.06em] text-[#2F5A43] underline transition-colors hover:text-[#B89868]"
              >
                +60173576747
              </a>
            </p>
          </section>
        )}
      </main>
    </div>
  )
}