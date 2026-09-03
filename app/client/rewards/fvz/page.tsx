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
      <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
        
{/* Header Hero Section */}
        {/* Reduced bottom padding (pb-3 sm:pb-4) and added a tight bottom margin (mb-3 sm:mb-4) */}
        <div className="text-center border-b border-[#3A5D49]/15 pb-3 sm:pb-4 mb-3 sm:mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="rounded-md bg-[#2F5A43]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#2F5A43]">
              NEW
            </span>
            <span className="text-base font-light uppercase tracking-[0.25em] text-[#2F5A43] lg:text-xl">
              Rewards Program
            </span>
          </div>
          <p className="text-[10px] sm:text-xs font-light uppercase tracking-[0.15em] text-[#3A5D49]/70">
            Francois Van Zyl
          </p>
        </div>

        {/* Your Rewards Counter Hero Banner - Full Background Image with Responsive Overlay */}
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

          {/* Translucent Overlay */}
          <div 
            className="absolute inset-0 bg-[#ECE8DC]/85 sm:bg-[#ECE8DC]/92 [clip-path:polygon(0_0,100%_0,100%_100%,0_100%)] sm:[clip-path:polygon(0_0,75%_0,55%_100%,0_100%)]"
          />

          {/* Content Layer */}
          <div className="relative z-10 flex min-h-[160px] flex-col justify-center p-5 sm:p-8">
            <div className="max-w-md space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#2F5A43]" />
                <h2 className="text-xs font-light uppercase tracking-[0.2em] text-[#2F5A43]">
                  Your Rewards
                </h2>
              </div>

              {/* Points & Message arranged side-by-side */}
              <div className="flex flex-row items-center gap-4 sm:gap-6 pt-1">
                <div className="shrink-0 text-left">
                  <span className="text-3xl font-serif tracking-tight text-[#2F5A43] sm:text-6xl">
                    {points}
                  </span>
                  <p className="mt-0.5 sm:mt-1 text-[10px] font-light uppercase tracking-[0.2em] text-[#3A5D49]/80">
                    Points
                  </p>
                </div>

                {/* Vertical Divider line */}
                <div className="h-10 sm:h-12 w-[1px] shrink-0 bg-[#3A5D49]/20" />

                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-sm sm:text-base font-serif text-[#2F5A43]">
                    You’re making progress!
                  </p>
                  <p className="text-[11px] sm:text-xs font-light leading-snug sm:leading-relaxed text-[#3A5D49]/80">
                    Keep showing up, earn points, and unlock exclusive rewards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Get Points For Showing Up Section */}
        <section className="space-y-4 sm:space-y-6">
          {/* Centered title section on mobile with lines flanking both sides */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] flex-1 bg-[#3A5D49]/15 md:hidden" />
            <Sun size={20} className="text-[#2F5A43] shrink-0" />
            <h2 className="text-sm font-light uppercase tracking-[0.2em] text-[#2F5A43] text-center">
              Get Points For Showing Up
            </h2>
            <div className="h-[1px] flex-1 bg-[#3A5D49]/15" />
          </div>

          <div className="space-y-3 sm:space-y-4">
            
            {/* Top Row Grid: 2 columns on mobile, 3 columns on desktop */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
              
              {/* Card 1: Complete a Lesson */}
              <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-between rounded-2xl border border-[#3A5D49]/20 bg-[#F4F1E8]/60 p-3.5 sm:p-6 text-center transition hover:bg-[#F4F1E8]">
                <div className="space-y-1.5 sm:space-y-3">
                  <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#E5E0D3] text-[#2F5A43]">
                    <CheckCircle2 size={20} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F5A43]">
                    Complete A Lesson
                  </h3>
                </div>

                <div className="mt-2.5 sm:mt-6 space-y-1">
                  <span className="inline-block rounded-full bg-[#E5E0D3] px-3.5 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-[12px] font-medium uppercase tracking-[0.15em] text-[#2F5A43]">
                    +10 Points
                  </span>
                  <p className="hidden sm:block text-[10px] opacity-0 select-none">
                    SPACER
                  </p>
                </div>
              </div>

              {/* Card 2: Purchase 5 Lessons */}
              <div className="col-span-1 flex flex-col items-center justify-between rounded-2xl border border-[#3A5D49]/20 bg-[#F4F1E8]/60 p-2.5 sm:p-6 text-center transition hover:bg-[#F4F1E8]">
                <div className="space-y-1.5 sm:space-y-3 w-full">
                  <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#E5E0D3] text-[#2F5A43]">
                    <Layers size={20} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  {/* Added whitespace-nowrap and tightened letter spacing on mobile */}
                  <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.05em] sm:tracking-[0.15em] text-[#2F5A43] whitespace-nowrap">
                    Purchase 5 Lessons
                  </h3>
                </div>

                <div className="mt-2.5 sm:mt-6 space-y-1">
                  <span className="inline-block rounded-full bg-[#E5E0D3] px-2 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-[12px] font-medium uppercase tracking-[0.08em] sm:tracking-[0.15em] text-[#2F5A43]">
                    +15 Points
                  </span>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.05em] sm:tracking-[0.1em] text-[#3A5D49]/60 whitespace-nowrap">
                    +10 PTS / LESSON
                  </p>
                </div>
              </div>

              {/* Card 3: Purchase 10 Lessons */}
              <div className="col-span-1 flex flex-col items-center justify-between rounded-2xl border border-[#3A5D49]/20 bg-[#F4F1E8]/60 p-2.5 sm:p-6 text-center transition hover:bg-[#F4F1E8]">
                <div className="space-y-1.5 sm:space-y-3 w-full">
                  <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#E5E0D3] text-[#2F5A43]">
                    <PackageCheck size={20} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  {/* Added whitespace-nowrap and tightened letter spacing on mobile */}
                  <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.05em] sm:tracking-[0.15em] text-[#2F5A43] whitespace-nowrap">
                    Purchase 10 Lessons
                  </h3>
                </div>

                <div className="mt-2.5 sm:mt-6 space-y-1">
                  <span className="inline-block rounded-full bg-[#E5E0D3] px-2 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-[12px] font-medium uppercase tracking-[0.08em] sm:tracking-[0.15em] text-[#2F5A43]">
                    +35 Points
                  </span>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.05em] sm:tracking-[0.1em] text-[#3A5D49]/60 whitespace-nowrap">
                    +10 PTS / LESSON
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom Row: Full-Width Free Group Training Card */}
            <div className="relative overflow-hidden rounded-2xl border border-[#3A5D49]/20 bg-[#EFECE3]/70 p-5 sm:p-6 shadow-sm">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-[#E5E0D3] text-[#2F5A43]">
                  <Users size={20} className="sm:w-[22px] sm:h-[22px]" />
                </div>

                <div className="h-10 w-[1px] bg-[#3A5D49]/20 shrink-0 hidden sm:block" />

                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-[13px] sm:text-[14px] font-semibold uppercase tracking-[0.15em] text-[#2F5A43]">
                    Free Group Training + Practice Days
                  </h3>
                  
                  <div className="space-y-2 text-[13px] sm:text-[14px] font-light text-[#2F5A43]/90 leading-relaxed">
                    <p>
                      As we want to reward dedication and learning, there will now be <span className="font-semibold text-[#2F5A43]">weekly free Group Trainings / Practice Days</span>.
                    </p>
                    <p>
                      Completing a training/practice day will count as completing a lesson <span className="underline underline-offset-4 decoration-[#3A5D49]/40 font-semibold text-[#2F5A43]">for 10 points</span>.
                    </p>
                    <p className="text-[#3A5D49]/70 pt-0.5 sm:pt-1">
                      Please contact Coach Francois or admin (+60 173576747) for more info as slots will be limited.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
</section>

        {/* Small Divider Line between Free Group Training and Referral Program */}
        {/* Increased bottom margin (mb-4) to create more space before the Referral Program banner */}
        <div className="mt-2 mb-4 h-[1px] w-full bg-[#3A5D49]/15" />

        {/* Referral Program Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-[#3A5D49]/30 bg-[#F4F1E8]/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#E5E0D3] text-[#2F5A43]">
                <UserPlus size={18} className="sm:w-[20px] sm:h-[20px]" />
              </div>

              <div className="space-y-0.5">
                <h3 className="text-[13px] sm:text-[14px] font-semibold uppercase tracking-[0.15em] text-[#2F5A43]">
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
        {/* Added -mt-2 (or -mt-3) to offset the parent container's gap */}
        <div className="-mt-2 sm:-mt-4 flex items-center gap-4">
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