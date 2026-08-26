import type { Metadata } from "next"
import FrancoisVanZylClient from "./FrancoisVanZylClient"

export const metadata: Metadata = {
  title: "Francois Van Zyl | Head Golf Coach | Gemini Golf Academy",
  description:
    "Learn about Head Coach Francois Van Zyl at Gemini Golf Academy in Petaling Jaya. PGA professional with 20+ years of teaching experience, swing analysis technology, and club fitting.",
  openGraph: {
    title: "Francois Van Zyl - Head Golf Coach",
    description:
      "PGA professional with 20+ years coaching experience specializing in customized instruction, TrackMan, HackMotion, Capto, and video swing analysis.",
    images: [{ url: "/OurCoaches/Francois_Action.png" }],
  },
}

export default function FrancoisVanZylPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Francois Van Zyl",
    "jobTitle": "Head Golf Coach",
    "worksFor": {
      "@type": "SportsActivityLocation",
      "name": "Gemini Golf Academy",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Petaling Jaya",
        "addressRegion": "Selangor",
        "addressCountry": "MY",
      },
    },
    "description":
      "PGA professional with over 20 years of golf coaching experience specializing in swing mechanics, TrackMan swing analysis, and player development.",
    "knowsAbout": [
      "Golf Instruction",
      "Swing Mechanics",
      "TrackMan Golf Analysis",
      "HackMotion Wrist Sensor",
      "Capto Putting System",
      "Master Club Fitting",
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FrancoisVanZylClient />
    </>
  )
}