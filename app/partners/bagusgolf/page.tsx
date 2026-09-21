"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

const storeLocations = [
  {
    name: "Publika Store",
    address: "D1, G4-8, Jln Dutamas 1, Solaris Dutamas, 50480 Kuala Lumpur, Wilayah Persekutuan",
    mapUrl:
      "https://google.com/maps?vet=10CAAQoqAOahcKEwiYtZG57PmWAxUAAAAAHQAAAAAQDA..i&fvr=1&pvq=Cg0vZy8xMWxkNXh0OGJyIhAKCmJhZ3VzIGdvbGYQAhgD&lqi=CgpiYWd1cyBnb2xmSNfCst6wsoCACFogEAAQARgAGAEiCmJhZ3VzIGdvbGYqBggCEAAQATICbXOSAQlnb2xmX3Nob3A&cs=1&um=1&ie=UTF-8&fb=1&gl=my&sa=X&ftid=0x31cc4960d2edb761:0xd91438bdf5149954",
  },
  {
    name: "Kinrara Golf Club Store",
    address: "Jalan Kinrara 6, Bandar Kinrara 6, 47100 Puchong, Selangor",
    mapUrl:
      "https://www.google.com/maps/place/BAGUS+GOLF+SHOP+Kinrara+Golf+Club+Store/@3.0379378,101.6547389,17z/data=!3m1!4b1!4m6!3m5!1s0x31cc4b1033067d2b:0x41862c2adb532511!8m2!3d3.0379378!4d101.6547389!16s%2Fg%2F11z6_c1v57?entry=ttu&g_ep=EgoyMDI2MDkxNi4wIKXMDSoASAFQAw%3D%3D",
  },
]

const onlineStores = [
  {
    name: "Shopee Official Store",
    label: "Shop Bagus Golf on Shopee",
    url: "https://shopee.com.my/bgs.golf.shop",
    icon: (
      <svg className="w-5 h-5 text-[#1b3022]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
      </svg>
    ),
  },
  {
    name: "Carousell Store",
    label: "Explore Listings on Carousell",
    url: "https://www.carousell.com.my/u/bgsgolfshop/",
    icon: (
      <svg className="w-5 h-5 text-[#1b3022]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
      </svg>
    ),
  },
]

const services = [
  {
    title: "100% Authentic Guarantee",
    desc: "Malaysia's destination for verified authentic golf equipment at unbeatable rates.",
  },
  {
    title: "Pre-Loved & New Sets",
    desc: "Explore top-tier pre-owned clubs alongside brand new gear suited for every budget.",
  },
  {
    title: "Beginner Starter Sets",
    desc: "Curated beginner packages designed to get you on the course without breaking the bank.",
  },
  {
    title: "In-Store Club & Shaft Fitting",
    desc: "Professional in-store fitting services to dial in your specs, shafts, and grip preferences.",
  },
  {
    title: "Trade-Ins Accepted",
    desc: "Upgrade seamlessly by trading in your existing clubs for store credit or instant savings.",
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
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

export default function BagusGolfPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function verifyAdminAccess() {
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

      if (profile?.role === "admin") {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
      }

      setLoading(false)
    }

    verifyAdminAccess()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ee] text-[#1b3022]">
        <div className="text-center font-light uppercase tracking-[0.2em] text-xs">
          Loading Partner Page...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1b3022] flex flex-col justify-between">
      <div>
        {/* Hero Header Banner */}
        <section className="relative w-full h-[220px] md:h-[260px] pt-12 md:pt-16 flex items-center overflow-hidden">
          <Image
            src="/OurCoaches/shortgame.jpg"
            alt="Bagus Golf Logo Header"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/60" />

          <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 w-full text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] md:text-xs uppercase tracking-widest text-[#d9cfbd] font-medium">
                EXCLUSIVE PARTNER
              </span>
              <div className="h-[1px] w-12 bg-[#d9cfbd]/60" />
            </div>
            <h1 className="text-2xl md:text-3xl font-light tracking-wider uppercase">
              BAGUS GOLF
            </h1>
            <p className="text-[11px] md:text-xs text-[#e0dad0] tracking-wide mt-1 max-w-lg font-light">
              Affordable, authentic equipment, pre-loved sets, and custom fittings.
            </p>
          </div>
        </section>

        {/* Main Content Body */}
        <main className="max-w-4xl mx-auto px-4 md:px-8 my-10">
          {!isAdmin ? (
            /* Coming Soon View for Non-Admins */
            <div className="flex justify-center py-16 md:py-24">
              <div className="max-w-md w-full bg-[#fdfbf7] border border-[#e5dec9] rounded-2xl p-10 shadow-sm text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#1b3022]/10 flex items-center justify-center mb-4 text-[#1b3022]">
                  ❖
                </div>
                <span className="text-[10px] uppercase tracking-widest text-[#1b3022]/70 font-semibold block">
                  PARTNER REWARDS
                </span>
                <h2 className="text-3xl font-light uppercase tracking-wider mt-2 text-[#1b3022]">
                  COMING SOON
                </h2>
                <p className="text-xs text-[#1b3022]/80 mt-3 leading-relaxed font-light">
                  We are curating exclusive partner benefits and discounts for our golfers. Check back shortly!
                </p>
              </div>
            </div>
          ) : (
            /* Full Admin Details View */
            <div className="space-y-8">
              {/* Unified Hero Feature Card */}
              <div className="bg-[#fdfbf7] border border-[#e5dec9] rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                  {/* Logo container with soft background padding */}
                  <div className="relative w-36 h-36 shrink-0 rounded-2xl bg-[#00a896]/10 p-3 border border-[#e5dec9] flex items-center justify-center">
                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-white">
                      <Image
                        src="/partners/bagus_golf/bagus-logo.png"
                        alt="Bagus Golf Logo"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  </div>

                  {/* Partner Info & Endorsement */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1b3022]/5 text-[#1b3022] text-[10px] font-semibold uppercase tracking-wider mb-2">
                      <span>❖</span> Recommended Partner
                    </div>
                    
                    <h2 className="text-2xl font-light uppercase tracking-wide text-[#1b3022]">
                      Bagus Golf
                    </h2>
                    
                    <p className="text-xs text-[#526351] font-light mt-1 leading-relaxed">
                      Malaysia's trusted source for authentic, budget-friendly golf gear, pre-loved club sets, trade-ins, and professional in-store fittings.
                    </p>

                    <div className="mt-4 pt-4 border-t border-[#e5dec9]">
                      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#1b3022]">
                        Why We Recommend Them
                      </h3>
                      <p className="text-xs text-[#526351] font-light leading-relaxed mt-1">
                        Getting into golf shouldn't require a steep financial barrier. We specifically chose Bagus Golf to introduce our beginner students to quality pre-loved equipment. Pre-loved doesn't mean "second best"—it's a smart, economical way to secure high-tier, authentic clubs while saving money.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Grid with Visual Badges */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1b3022]/70 mb-4 px-1">
                  What Bagus Golf Offers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {services.map((item) => (
                    <div
                      key={item.title}
                      className="bg-[#fdfbf7] border border-[#e5dec9] rounded-xl p-4 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-semibold text-[#1b3022] uppercase tracking-wide">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-[#526351] font-light mt-1.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Online Stores Section */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1b3022]/70 mb-4 px-1">
                  Online Stores
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {onlineStores.map((store) => (
                    <a
                      key={store.name}
                      href={store.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-[#fdfbf7] border border-[#e5dec9] rounded-xl p-5 shadow-sm transition-all duration-200 hover:border-[#1b3022] hover:shadow-md flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#1b3022]/5 flex items-center justify-center shrink-0">
                        {store.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-[#1b3022] uppercase tracking-wide truncate">
                          {store.name}
                        </h4>
                        <p className="text-xs text-[#526351] font-light truncate">
                          {store.label}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-[#1b3022] group-hover:translate-x-0.5 transition-transform">
                        →
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Locations Section */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1b3022]/70 mb-4 px-1">
                  Store Locations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {storeLocations.map((loc) => (
                    <div
                      key={loc.name}
                      className="bg-[#fdfbf7] border border-[#e5dec9] rounded-xl p-6 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-[#1b3022]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <h4 className="text-sm font-medium text-[#1b3022] uppercase tracking-wide">
                            {loc.name}
                          </h4>
                        </div>
                        <p className="text-xs text-[#526351] font-light leading-relaxed pl-6">
                          {loc.address}
                        </p>
                      </div>

                      <div className="pt-6 pl-6">
                        <a
                          href={loc.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#1b3022] hover:underline"
                        >
                          View on Google Maps →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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