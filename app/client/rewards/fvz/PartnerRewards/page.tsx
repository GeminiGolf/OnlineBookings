import Image from "next/image";
import Link from "next/link";

const partners = [
  {
    name: "Bagus Golf",
    description: "Premium golf equipment, apparel, and custom fitting services.",
    logo: "/partners/bagus_golf/bagus-logo.png",
    href: "/client/rewards/fvz/PartnerRewards/BagusGolf",
    comingSoon: false,
  },
  {
    name: "Rise and Plunge",
    description: "Recovery & wellness experiences built for peak athletic performance.",
    logo: "/partners/rise_and_plunge/rnp_logo.png",
    href: "/client/rewards/fvz/PartnerRewards/RiseAndPlunge",
    comingSoon: false,
  },
  {
    name: "Coming Soon",
    description: "We are onboarding exciting new premium brands. Stay tuned!",
    logo: null,
    href: "#",
    comingSoon: true,
  },
  {
    name: "Coming Soon",
    description: "Exclusive member perks with our upcoming lifestyle partner.",
    logo: null,
    href: "#",
    comingSoon: true,
  },
];

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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export default function PartnerRewardsPage() {
  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1b3022]">
      {/* Header Hero Banner with top padding to push content under navbar */}
      <section className="relative w-full h-[220px] md:h-[260px] pt-12 md:pt-16 flex items-center overflow-hidden">
        <Image
          src="/OurCoaches/shortgame.jpg"
          alt="Golf background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 w-full text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] md:text-xs uppercase tracking-widest text-[#d9cfbd] font-medium">
              BRAND PARTNER
            </span>
            <div className="h-[1px] w-12 bg-[#d9cfbd]/60" />
          </div>
          <h1 className="text-2xl md:text-3xl font-light tracking-wider uppercase">
            REWARDS
          </h1>
          <p className="text-[11px] md:text-xs text-[#e0dad0] tracking-wide mt-1 max-w-lg font-light">
            Explore exclusive perks and benefits offered by our brand partners.
          </p>
        </div>
      </section>

      {/* Partners Cards Grid */}
      <main className="max-w-5xl mx-auto px-4 md:px-8 my-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {partners.map((partner, idx) => {
            if (partner.comingSoon) {
              return (
                <div
                  key={idx}
                  className="bg-[#fdfbf7]/60 border border-dashed border-[#d5cebc] rounded-2xl p-6 flex flex-col items-center text-center h-full opacity-75"
                >
                  <div className="w-70 h-40 mx-auto rounded-xl bg-white/50 border border-dashed border-[#d5cebc] p-2 mb-5 flex flex-col items-center justify-center text-[#8e988d]">
                    <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-xs uppercase tracking-widest font-medium text-[#7a8879]">
                      More Partners
                    </span>
                  </div>

                  <h2 className="text-lg font-medium tracking-wide uppercase text-[#5a6b5c]">
                    {partner.name}
                  </h2>
                  <p className="text-xs text-[#7a8879] leading-relaxed mt-2 font-light">
                    {partner.description}
                  </p>

                  <span className="mt-auto pt-6 text-[10px] font-semibold uppercase tracking-widest text-[#8e988d]">
                    ANNOUNCING SOON
                  </span>
                </div>
              );
            }

            return (
              <Link key={partner.name} href={partner.href} className="group block">
                <div className="bg-[#fdfbf7] border border-[#e5dec9] rounded-2xl p-6 shadow-sm transition-all duration-200 group-hover:border-[#1b3022] group-hover:shadow-md flex flex-col items-center text-center h-full">
                  {/* Logo Box */}
                  <div className="w-70 h-40 mx-auto rounded-xl bg-white border border-[#e5dec9] p-2 mb-5 flex items-center justify-center">
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                      {partner.logo && (
                        <Image
                          src={partner.logo}
                          alt={`${partner.name} logo`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <h2 className="text-lg font-medium tracking-wide uppercase text-[#1b3022]">
                    {partner.name}
                  </h2>
                  <p className="text-xs text-[#526351] leading-relaxed mt-2 font-light">
                    {partner.description}
                  </p>

                  {/* View Perk Link Indicator */}
                  <span className="mt-auto pt-6 text-[10px] font-semibold uppercase tracking-widest text-[#1b3022] group-hover:underline">
                    VIEW REWARDS →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer Banner */}
      <section className="relative w-full py-6 px-6 overflow-hidden text-center text-white">
        <Image
          src="/images/putt.jpg"
          alt="Putting background"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0f1c13]/75" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Top Divider / Crest */}
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

          {/* Benefits Icons Row */}
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
  );
}