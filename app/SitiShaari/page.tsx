import type { Metadata } from "next"
import SitiShaariClient from "./SitiShaariClient"

export const metadata: Metadata = {
  title: "Siti Shaari | Player Development Coach | Gemini Golf Academy",
  description:
    "PGAM professional Siti Shaari offers private golf lessons for beginners to touring pros at Gemini Golf Academy in Petaling Jaya. 20+ years of player development experience.",
  keywords: [
    "Siti Shaari",
    "Beginner Golf Lessons Petaling Jaya",
    "Pro Golf Coach Kuala Lumpur",
    "Golf Coach Selangor",
    "Private Golf Lessons PJ",
    "Beginner Golf Coach Kuala Lumpur",
    "Golf Academy Kuala Lumpur",
    "Gemini Golf Academy",
  ],
  alternates: {
    canonical: "https://www.geminigolfacademy.com/SitiShaari",
  },
  openGraph: {
    title: "Siti Shaari - Player Development Golf Coach | Gemini Golf Academy",
    description:
      "PGA professional with 20+ years coaching golfers of all skill levels—from beginners learning foundational mechanics to elite pros refining tour performance.",
    url: "https://www.geminigolfacademy.com/SitiShaari",
    siteName: "Gemini Golf Academy",
    images: [
      {
        url: "/OurCoaches/Siti_Action.jpeg",
        width: 1200,
        height: 630,
        alt: "Siti Shaari Player Development Coach",
      },
    ],
    locale: "en_US",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Siti Shaari | Player Development Coach",
    description:
      "PGA Golf Professional specializing in beginner to pro level golf instruction and personalized player development.",
    images: ["/OurCoaches/Siti_Action.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SitiShaariPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Siti Shaari",
    "jobTitle": "Player Development Coach",
    "email": "mailto:siti@geminigolfacademy.com",
    "sameAs": ["https://www.instagram.com/sitishaari.golf"],
    "worksFor": {
      "@type": "SportsActivityLocation",
      "name": "Gemini Golf Academy",
      "url": "https://geminigolfacademy.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Petaling Jaya",
        "addressRegion": "Selangor",
        "addressCountry": "MY",
      },
    },
    "description":
      "PGAM professional with over 20 years of golf playing and coaching experience. Tailored golf lessons for complete beginners, intermediate golfers, women golfers, and competing juniors.",
    "knowsAbout": [
      "Beginner Golf Lessons",
      "Junior Golf Coaching",
      "Women's Golf Development",
      "Golf Instruction & Player Development",
      "Golf Swing Mechanics",
      "Mental Game & On-Course Confidence",
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SitiShaariClient />
    </>
  )
}