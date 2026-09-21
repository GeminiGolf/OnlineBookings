"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Sparkles, Lock, ArrowLeft } from "lucide-react"

const EXPECTED_COACH_ID = 1

interface ClientData {
  id: number
  name: string
  primary_coach_id: number | null
  points: number | null
}

const storeLocations = [
  {
    name: "Mont Kiara",
    addressLines: [
      "Level 2, 1 Mont Kiara",
      "Jalan Kiara,",
      "Mont Kiara,",
      "50480 Kuala Lumpur",
    ],
    hoursLines: ["Daily: 8:00 AM - 9:00 PM"],
    image: "/partners/rise_and_plunge/MK.png",
    mapUrl:
      "https://maps.google.com/?q=1+Mont+Kiara+Jalan+Kiara+Mont+Kiara+50480+Kuala+Lumpur",
  },
  {
    name: "Bangsar",
    addressLines: [
      "Lot No. 2F-8, 9 & 10, 2nd Floor",
      "Bangsar Village II",
      "2, Jalan Telawi 3, Bangsar Baru",
      "59100 Kuala Lumpur",
    ],
    hoursLines: [
      "Mondays: Closed",
      "Tue - Fri: 10:00 AM - 8:00 PM",
      "Sat - Sun: 9:00 AM - 8:00 PM",
    ],
    image: "/partners/rise_and_plunge/bangsar.png",
    mapUrl:
      "https://maps.google.com/?q=Bangsar+Village+II+Jalan+Telawi+3+Bangsar+Baru+59100+Kuala+Lumpur",
  },
  {
    name: "Ampang",
    addressLines: [
      "Lot L1-43, The Campus Ampang",
      "Jalan Kolam Air Lama",
      "Mukim Hulu Kelang",
      "68000, Selangor",
    ],
    hoursLines: [
      "Mon - Fri: 10:00 AM - 8:00 PM",
      "Sat - Sun: 9:00 AM - 8:00 PM",
    ],
    image: "/partners/rise_and_plunge/ampang.png",
    mapUrl:
      "https://maps.google.com/?q=The+Campus+Ampang+Jalan+Kolam+Air+Lama+68000+Selangor",
  },
]

const rewardOffers = [
  {
    title: "Ice Bath Experience",
    duration: "15 minutes",
    points: 50,
    offer: "1 Free Session",
    image: "/partners/rise_and_plunge/icebath.png",
  },
  {
    title: "Sauna & Ice Bath Combo",
    duration: "45 minutes",
    points: 75,
    offer: "1 Free Session",
    image: "/partners/rise_and_plunge/sauna_and_bath.png",
  },
  {
    title: "2 Pax Sauna & Ice Bath",
    duration: "45 minutes",
    points: 100,
    offer: "1 Free Session",
    image: "/partners/rise_and_plunge/2pax.png",
  },
]

const benefits = [
  {
    title: "EXCLUSIVE DISCOUNTS",
    icon: (
      <svg className="w-5 h-5 mx-auto text-[#d9cfbd] mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2zm0 13C10.832 21 2 20 2 12c0-3 2.5-5 5-5h10c2.5 0 5 2 5 5 0 8-8.832 9-10 9z" />
      </svg>
    ),
  },
  {
    title: "MEMBER-ONLY OFFERS",
    icon: (
      <svg className="w-5 h-5 mx-auto text-[#d9cfbd] mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    title: "EARLY ACCESS TO NEW PRODUCTS",
    icon: (
      <svg className="w-5 h-5 mx-auto text-[#d9cfbd] mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    title: "SPECIAL EXPERIENCES",
    icon: (
      <svg className="w-5 h-5 mx-auto text-[#d9cfbd] mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
]

export default function RiseAndPlungePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState<boolean>(false)
  const [points, setPoints] = useState<number>(0)
  const [client, setClient] = useState<ClientData | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)

  useEffect(() => {
    async function verifyAccess() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace("/login")
        return
      }

      // Check profile role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      // 1. Admins automatically get access
      if (profile?.role === "admin") {
        setHasAccess(true)
        setLoading(false)
        return
      }

      // 2. Clients check: must have primary_coach_id === EXPECTED_COACH_ID (1)
      if (profile?.role === "client") {
        const { data: clientData } = await supabase
          .from("clients")
          .select("id, name, primary_coach_id, points")
          .eq("profile_id", session.user.id)
          .single()

        if (clientData) {
          setClient(clientData)
          setPoints(clientData.points ?? 0)

          if (clientData.primary_coach_id === EXPECTED_COACH_ID) {
            setHasAccess(true)
          }
        }
      }

      setLoading(false)
    }

    verifyAccess()
  }, [router])

  const handleRedeem = async (itemName: string, pointsRequired: number) => {
    if (points < pointsRequired || !client) return

    const confirmed = window.confirm(
      `Confirm redemption of ${itemName} for ${pointsRequired} points?`
    )

    if (!confirmed) return

    setIsRedeeming(true)

    try {
      const { data: newBalance, error } = await supabase.rpc("redeem_reward", {
        p_client_id: client.id,
        p_client_name: client.name,
        p_points_spent: pointsRequired,
        p_reward_name: itemName,
        p_client_coach: client.primary_coach_id,
      })

      if (error) {
        console.error("Redemption error:", error.message)
        alert(error.message || "Failed to redeem reward. Please try again.")
        return
      }

      const { data: createdNotif } = await supabase
        .from("notifications")
        .select("id")
        .eq("client_id", client.id)
        .eq("type", "points_redeemed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (createdNotif?.id) {
        await fetch("/api/admin/notifications/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: createdNotif.id }),
        })
      }

      setPoints(newBalance)
      alert("Congratulations! Your reward will be credited shortly!")
    } catch {
      alert("An unexpected error occurred. Please try again.")
    } finally {
      setIsRedeeming(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ee] text-[#1b3022]">
        <div className="text-center font-light uppercase tracking-[0.2em] text-xs">
          Loading Partner Page...
        </div>
      </div>
    )
  }

  // Fallback UI when user is not an Admin or Coach 1 client
  if (!hasAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f4ee] px-4 text-center text-[#1b3022]">
        <div className="mb-4 rounded-full bg-[#1b3022]/5 p-4 text-[#1b3022]">
          <Lock size={28} />
        </div>
        <h1 className="text-xl font-light uppercase tracking-[0.2em]">
          Exclusive Partner Offer
        </h1>
        <p className="mt-2 max-w-sm text-xs font-light text-[#526351]">
          This partner offer is currently restricted to select program members. Please contact your coach for more details.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1b3022] flex flex-col justify-between pt-10 md:pt-12">
      <div>
        {/* Branch Image Hero Header with Overlay Logo */}
        <section className="relative w-full h-[240px] md:h-[300px] flex flex-col items-center justify-center overflow-hidden border-b border-[#e5dec9]/30">
          <Image
            src="/partners/rise_and_plunge/banner.png"
            alt="Rise & Plunge Branch"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-64 h-28 md:w-80 md:h-36 mb-2 drop-shadow-md">
              <Image
                src="/partners/rise_and_plunge/rnp_logo.png"
                alt="Rise & Plunge Logo"
                fill
                priority
                sizes="(max-width: 768px) 256px, 320px"
                className="object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-8 bg-[#d9cfbd]/70" />
              <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-[#d9cfbd] font-medium drop-shadow-xs">
                EXCLUSIVE RECOVERY PARTNER
              </span>
              <div className="h-[1px] w-8 bg-[#d9cfbd]/70" />
            </div>
          </div>
        </section>

        {/* Main Content Body */}
        <main className="max-w-5xl mx-auto px-4 md:px-8 my-10 space-y-8">
          {/* Small Points Display Bar */}
          <div className="bg-[#fdfbf7] border border-[#e5dec9] rounded-xl px-5 py-3 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#1b3022]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1b3022]">
                Your Points Balance
              </span>
            </div>
            <div className="text-sm font-bold text-[#1b3022] tracking-wide">
              {points} <span className="text-[10px] uppercase font-normal text-[#526351]">PTS</span>
            </div>
          </div>

          {/* 1. Reward Redemption Offers (3 Side-by-Side Cards) */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1b3022]/70 mb-4 px-1">
              Exclusive Points Rewards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rewardOffers.map((offer) => {
                const canAfford = points >= offer.points
                return (
                  <div
                    key={offer.title}
                    className="bg-[#fdfbf7] border border-[#e5dec9] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="relative w-full h-56 md:h-60 bg-[#1b3022]/5">
                      <Image
                        src={offer.image}
                        alt={offer.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-[#1b3022] text-[#d9cfbd] text-[10px] font-semibold uppercase px-3 py-1 rounded-full shadow-md">
                        {offer.points} Points
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-[#1b3022]/60 mb-2">
                        {offer.duration} • {offer.offer}
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-base font-medium uppercase tracking-wide text-[#1b3022]">
                          {offer.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleRedeem(offer.title, offer.points)}
                          disabled={!canAfford || isRedeeming}
                          className={`text-[10px] font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors shrink-0 ${
                            canAfford && !isRedeeming
                              ? "bg-[#1b3022] text-[#f7f4ee] hover:bg-[#2c4733]"
                              : "bg-[#e5dec9]/60 text-[#1b3022]/40 cursor-not-allowed"
                          }`}
                        >
                          Redeem
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2. Branch Locations */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1b3022]/70 mb-4 px-1">
              Locations & Hours
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {storeLocations.map((loc) => (
                <div
                  key={loc.name}
                  className="bg-[#fdfbf7] border border-[#e5dec9] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between p-4 md:p-5"
                >
                  <div className="flex flex-col">
                    {/* Image Header */}
                    <div className="relative w-full h-40 md:h-48 shrink-0 bg-[#1b3022]/5 rounded-xl overflow-hidden mb-3 md:mb-4">
                      <Image
                        src={loc.image}
                        alt={loc.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Location Name & Address */}
                    <div>
                      <h4 className="text-sm md:text-base font-semibold text-[#1b3022] uppercase tracking-wide mb-1.5 md:mb-2">
                        {loc.name}
                      </h4>
                      <div className="text-[11px] md:text-xs text-[#526351] font-light leading-relaxed space-y-0.5">
                        {loc.addressLines.map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                    </div>

                    {/* Operating Hours below Address */}
                    <div className="border-t border-[#e5dec9]/70 pt-3 mt-3">
                      <div className="flex items-center gap-1.5 text-[11px] md:text-xs text-[#1b3022] font-semibold mb-1">
                        <svg className="w-3.5 h-3.5 text-[#1b3022] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Operating Hours</span>
                      </div>
                      <div className="text-[11px] md:text-xs text-[#526351] font-light space-y-0.5">
                        {loc.hoursLines.map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* View on Google Maps Link */}
                  <div className="pt-3 md:pt-4 mt-3 md:mt-4 border-t border-[#e5dec9]/70">
                    <a
                      href={loc.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-semibold uppercase tracking-widest text-[#1b3022] hover:underline"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Partner Overview & Why We Partnered */}
          <div className="bg-[#fdfbf7] border border-[#e5dec9] rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1b3022]/5 text-[#1b3022] text-[10px] font-semibold uppercase tracking-wider mb-3">
              <span>❖</span> Premium Recovery Partner
            </div>

            <h2 className="text-2xl font-light uppercase tracking-wide text-[#1b3022]">
              Rise & Plunge
            </h2>

            <p className="text-xs text-[#526351] font-light mt-1.5 leading-relaxed">
              Malaysia's premier contrast therapy studio featuring private suites equipped with full-spectrum infrared saunas and precision ice baths built to optimize physical performance and mental clarity.
            </p>

            <div className="mt-5 pt-5 border-t border-[#e5dec9]">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#1b3022]">
                Why Contrast Therapy Matters for Golfers
              </h3>
              <p className="text-xs text-[#526351] font-light leading-relaxed mt-1.5">
                Golfers are athletes. Both practice and rounds place high physical stress on body while demanding sharp focus over several hours. Contrast therapy combines deep thermal heat and cold exposure to accelerate complete recovery.
              </p>
              
              <ul className="mt-3 space-y-2 text-xs text-[#526351] font-light list-disc list-inside">
                <li>
                  <strong className="text-[#1b3022] font-medium">Muscle & Joint Recovery:</strong> Infrared heat eases muscular tightness and restores rotational flexibility, while ice baths flush inflammation and post-round soreness.
                </li>
                <li>
                  <strong className="text-[#1b3022] font-medium">Mental Edge & Focus:</strong> Cold exposure lowers stress, sharpens alertness, and builds the nervous system resilience needed to stay locked in down the stretch.
                </li>
              </ul>
            </div>
          </div>

          {/* Back to Partner Rewards Navigation Button */}
          <div className="flex justify-center pt-1 pb-0">
            <Link
              href="/client/rewards/fvz/PartnerRewards"
              className="inline-flex items-center gap-2 rounded-full border border-[#e5dec9] bg-[#fdfbf7] px-5 py-2 text-xs uppercase tracking-[0.15em] text-[#1b3022] shadow-sm transition hover:bg-[#1b3022] hover:text-[#f7f4ee] active:scale-[0.98]"
            >
              <ArrowLeft size={16} /> Back to Partner Rewards
            </Link>
          </div>
        </main>
      </div>

      {/* Footer Banner */}
      <section className="relative w-full py-6 px-6 overflow-hidden text-center text-white">
        <Image
          src="/images/putt.jpg"
          alt="Putting background"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0f1c13]/75" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-[1px] w-10 bg-[#d9cfbd]/50" />
            <span className="text-[#d9cfbd] text-xs">❖</span>
            <div className="h-[1px] w-10 bg-[#d9cfbd]/50" />
          </div>

          <h2 className="text-xs md:text-sm font-light tracking-[0.2em] uppercase text-[#f7f4ee] leading-snug">
            EXCLUSIVE BRANDS. <br className="hidden md:inline" />
            REAL BENEFITS. <br className="hidden md:inline" />
            FOR OUR GOLFERS.
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-[#d9cfbd]/20">
            {benefits.map((item, index) => (
              <div
                key={item.title}
                className={`flex flex-col items-center px-2 ${
                  index !== benefits.length - 1 ? "md:border-r md:border-[#d9cfbd]/20" : ""
                }`}
              >
                {item.icon}
                <span className="text-[9px] uppercase tracking-widest text-[#d9cfbd] font-medium leading-tight max-w-[120px]">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}