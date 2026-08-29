import type { Metadata } from "next"
import SitiShaariClient from "./SitiShaariClient"

export const metadata: Metadata = {
  title: "Siti Shaari | Head Golf Coach | Gemini Golf Academy",
  description:
    "PGA professional Siti Shaari offers private golf lessons for beginners to touring pros at Gemini Golf Academy in Petaling Jaya. 20+ years of player development experience.",
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
    canonical: "https://www.geminigolfacademy.com/FrancoisVanZyl",
  },
  openGraph: {
    title: "Siti Shaari - Head Golf Coach | Gemini Golf Academy",
    description:
      "PGA professional with 20+ years coaching golfers of all skill levels—from beginners learning foundational mechanics to elite pros refining tour performance.",
    url: "https://www.geminigolfacademy.com/FrancoisVanZyl",
    siteName: "Gemini Golf Academy",
    images: [
      {
        url: "/OurCoaches/Francois_Action.png",
        width: 1200,
        height: 630,
        alt: "Siti Shaari Head Golf Coach",
      },
    ],
    locale: "en_US",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Siti Shaari | Head Golf Coach",
    description:
      "PGA Golf Professional specializing in beginner to pro level golf instruction and personalized player development.",
    images: ["/OurCoaches/Francois_Action.png"],
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
      "PGA professional with over 20 years of golf coaching experience. Tailored golf lessons for complete beginners, intermediate golfers, competing juniors, and professional players.",
    "knowsAbout": [
      "Beginner Golf Lessons",
      "Pro Golf Coaching",
      "Golf Instruction & Player Development",
      "Golf Swing Mechanics",
      "Short Game & Putting Coaching",
      "Master Club Fitting",
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