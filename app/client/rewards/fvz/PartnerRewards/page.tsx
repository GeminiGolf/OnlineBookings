import Image from "next/image";
import Link from "next/link";

const partners = [
  {
    name: "Bagus Golf",
    description: "Premium golf equipment, apparel, and custom fitting services.",
    logo: "/partners/bagus_golf/bagus-logo.png",
    href: "/client/rewards/fvz/PartnerRewards/BagusGolf",
  },
  {
    name: "Rise and Plunge",
    description: "Recovery & wellness experiences built for peak athletic performance.",
    logo: "/partners/rise_and_plunge/rnp_logo.png",
    href: "/client/rewards/fvz/PartnerRewards/RiseAndPlunge",
  },
];

export default function PartnerRewardsPage() {
  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1b3022] pb-16">
      {/* Header Banner */}
      <section className="w-full bg-[#1b3022] text-[#f7f4ee] px-6 py-12 md:px-10">
        <div className="max-w-5xl mx-auto">
          <span className="block text-xs uppercase tracking-widest text-[#d9cfbd] font-medium mb-1">
            EXCLUSIVES
          </span>
          <h1 className="text-3xl md:text-4xl font-light tracking-wider uppercase">
            PARTNER REWARDS
          </h1>
          <p className="text-xs text-[#d9cfbd] tracking-wide mt-2 max-w-xl">
            Explore exclusive perks and benefits offered by our official partners.
          </p>
        </div>
      </section>

      {/* Partners Grid */}
      <main className="max-w-5xl mx-auto px-4 md:px-8 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {partners.map((partner) => (
            <Link key={partner.name} href={partner.href} className="group block">
              <div className="bg-[#fdfbf7] border border-[#e5dec9] rounded-2xl p-6 shadow-sm transition-all duration-200 group-hover:border-[#1b3022] group-hover:shadow-md flex flex-col items-center text-center h-full">
                {/* Logo Box */}
                <div className="w-70 h-40 mx-auto rounded-xl bg-white border border-[#e5dec9] p-2 mb-5 flex items-center justify-center">
                  <div className="relative w-full h-full rounded-lg overflow-hidden">
                    <Image
                      src={partner.logo}
                      alt={`${partner.name} logo`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
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
                  View Rewards →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}