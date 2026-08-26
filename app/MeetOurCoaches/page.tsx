import type { Metadata } from "next"
import MeetOurCoachesClient from "./MeetOurCoachesClient"

export const metadata: Metadata = {
  title: "Meet Our Golf Coaches | Gemini Golf Academy",
  description: "Discover our certified golf instructors at Gemini Golf Academy, Kuala Lumpur.",
}

export default function MeetOurCoachesPage() {
  return <MeetOurCoachesClient />
}