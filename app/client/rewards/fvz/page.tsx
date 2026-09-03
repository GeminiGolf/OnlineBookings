"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"
import { 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  PackageCheck, 
  Users, 
  UserPlus,
  Sun
} from "lucide-react"

const EXPECTED_COACH_ID = 1

export default function FvzRewardsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [points, setPoints] = useState<number>(0)

  useEffect(() => {
    async function verifyAccess() {
      // 1. Check current session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace("/login")
        return
      }

      // 2. Verify profile role is client
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (profile?.role !== "client") {
        router.replace("/dashboard")
        return
      }

      // 3. Check client primary_coach_id matches coach ID 1 & fetch points
      const { data: client } = await supabase
        .from("clients")
        .select("primary_coach_id, points")
        .eq("profile_id", session.user.id)
        .single()

      if (!client || client.primary_coach_id !== EXPECTED_COACH_ID) {
        router.replace("/client/dashboard")
        return
      }

      setPoints(client.points ?? 0)
      setLoading(false)
    }

    verifyAccess()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF8F3] text-[#2F5A43]">
        <div className="text-center font-light uppercase tracking-[0.2em] text-xs">
          Loading Rewards...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5EE] px-4 pt-20 pb-16 text-[#2F5A43] lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Header Hero Section */}
        <div className="text-center border-b border-[#3A5D49]/15 pb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="rounded-md bg-[#2F5A43]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#2F5A43]">
              NEW
            </span>
            <span className="text-xl font-light uppercase tracking-[0.25em] text-[#2F5A43] lg:text-2xl">
              Rewards Program
            </span>
          </div>
          <p className="text-xs font-light uppercase tracking-[0.15em] text-[#3A5D49]/70">
            Francois Van Zyl
          </p>
        </div>

        {/* Your Rewards Counter Hero Banner - Full Background Image with Translucent Overlay */}
        <div className="relative min-h-[160px] overflow-hidden rounded-3xl border border-[#3A5D49]/20 shadow-sm">
          {/* Full-bleed Background Image across the entire card */}
          <div className="absolute inset-0 h-full w-full">
            <Image
              src="/images/putt.jpg"
              alt="Golf putting on green"
              fill
              sizes="100vw"
              priority
              className="object-cover object-center"
            />
          </div>

          {/* Translucent Overlay - Clean tint without backdrop-blur artifacts */}
          <div 
            className="absolute inset-0 bg-[#ECE8DC]/92"
            style={{
              clipPath: "polygon(0 0, 75% 0, 55% 100%, 0 100%)"
            }}
          />

          {/* Content Layer */}
          <div className="relative z-10 flex min-h-[160px] flex-col justify-center p-6 sm:p-8">
            <div className="max-w-md space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#2F5A43]" />
                <h2 className="text-xs font-light uppercase tracking-[0.2em] text-[#2F5A43]">
                  Your Rewards
                </h2>
              </div>

              {/* Points & Message vertically aligned */}
              <div className="flex items-center gap-6 pt-1">
                <div className="shrink-0 text-center sm:text-left">
                  <span className="text-5xl font-serif tracking-tight text-[#2F5A43] sm:text-6xl">
                    {points}
                  </span>
                  <p className="mt-1 text-[10px] font-light uppercase tracking-[0.2em] text-[#3A5D49]/80">
                    Points
                  </p>
                </div>

                <div className="h-12 w-[1px] shrink-0 bg-[#3A5D49]/20" />

                <div className="space-y-1">
                  <p className="text-base font-serif text-[#2F5A43]">
                    You’re making progress!
                  </p>
                  <p className="text-xs font-light leading-relaxed text-[#3A5D49]/80">
                    Keep showing up, earn points, and unlock exclusive rewards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Get Points For Showing Up Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Sun size={20} className="text-[#2F5A43]" />
            <h2 className="text-sm font-light uppercase tracking-[0.2em] text-[#2F5A43]">
              Get Points For Showing Up
            </h2>
            <div className="h-[1px] flex-1 bg-[#3A5D49]/15" />
          </div>

          <div className="space-y-4">
            
            {/* Top Row: 3-Column Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              
              {/* Card 1: Complete a Lesson */}
              <div className="flex flex-col items-center justify-between rounded-2xl border border-[#3A5D49]/20 bg-[#F4F1E8]/60 p-6 text-center transition hover:bg-[#F4F1E8]">
                <div className="space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E5E0D3] text-[#2F5A43]">
                    <CheckCircle2 size={22} />
                  </div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F5A43]">
                    Complete A Lesson
                  </h3>
                </div>

                <div className="mt-6 space-y-1">
                  <span className="inline-block rounded-full bg-[#E5E0D3] px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.15em] text-[#2F5A43]">
                    +10 Points
                  </span>
                  <p className="text-[10px] opacity-0 select-none">
                    SPACER
                  </p>
                </div>
              </div>

              {/* Card 2: Purchase 5 Lessons */}
              <div className="flex flex-col items-center justify-between rounded-2xl border border-[#3A5D49]/20 bg-[#F4F1E8]/60 p-6 text-center transition hover:bg-[#F4F1E8]">
                <div className="space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E5E0D3] text-[#2F5A43]">
                    <Layers size={22} />
                  </div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F5A43]">
                    Purchase 5 Lessons
                  </h3>
                </div>

                <div className="mt-6 space-y-1">
                  <span className="inline-block rounded-full bg-[#E5E0D3] px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.15em] text-[#2F5A43]">
                    +15 Points
                  </span>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-[#3A5D49]/60">
                    +10 PTS PER LESSON
                  </p>
                </div>
              </div>

              {/* Card 3: Purchase 10 Lessons */}
              <div className="flex flex-col items-center justify-between rounded-2xl border border-[#3A5D49]/20 bg-[#F4F1E8]/60 p-6 text-center transition hover:bg-[#F4F1E8]">
                <div className="space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E5E0D3] text-[#2F5A43]">
                    <PackageCheck size={22} />
                  </div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F5A43]">
                    Purchase 10 Lessons
                  </h3>
                </div>

                <div className="mt-6 space-y-1">
                  <span className="inline-block rounded-full bg-[#E5E0D3] px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.15em] text-[#2F5A43]">
                    +35 Points
                  </span>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-[#3A5D49]/60">
                    +10 PTS PER LESSON
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom Row: Full-Width Free Group Training Card */}
            <div className="relative overflow-hidden rounded-2xl border border-[#3A5D49]/20 bg-[#EFECE3]/70 p-6 shadow-sm">
              <div className="flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E5E0D3] text-[#2F5A43]">
                  <Users size={22} />
                </div>

                <div className="h-10 w-[1px] bg-[#3A5D49]/20 shrink-0 hidden sm:block" />

                <div className="space-y-3">
                  <h3 className="text-[14px] font-semibold uppercase tracking-[0.15em] text-[#2F5A43]">
                    Free Group Training + Practice Days
                  </h3>
                  
                  <div className="space-y-2 text-[14px] font-light text-[#2F5A43]/90 leading-relaxed">
                    <p>
                      As we want to reward dedication and learning, there will now be <span className="font-semibold text-[#2F5A43]">weekly free Group Trainings / Practice Days</span>.
                    </p>
                    <p>
                      Completing a training/practice day will count as completing a lesson <span className="underline underline-offset-4 decoration-[#3A5D49]/40 font-semibold text-[#2F5A43]">for 10 points</span>.
                    </p>
                    <p className="text-[#3A5D49]/70 pt-1">
                      Please contact Coach Francois or admin (+60 173576747) for more info as slots will be limited.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Referral Program Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-[#3A5D49]/30 bg-[#F4F1E8]/80 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E5E0D3] text-[#2F5A43]">
                <UserPlus size={20} />
              </div>

              <div className="space-y-0.5">
                <h3 className="text-[14px] font-semibold uppercase tracking-[0.15em] text-[#2F5A43]">
                  Referral Program
                </h3>
                <p className="text-xs font-light text-[#3A5D49]/90 leading-relaxed">
                  Bring a friend! When they take any package, you'll receive <span className="font-semibold text-[#2F5A43]">1 free lesson</span>.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Note */}
        <div className="flex items-center gap-4 pt-4">
          <div className="h-[1px] flex-1 bg-[#3A5D49]/15" />
          <p className="text-center text-[10px] font-light uppercase tracking-[0.2em] text-[#3A5D49]/60">
            Stay tuned for more ways to earn points
          </p>
          <div className="h-[1px] flex-1 bg-[#3A5D49]/15" />
        </div>

      </div>
    </div>
  )
}