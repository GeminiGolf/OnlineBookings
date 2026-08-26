import type { Metadata } from "next"
import CoachAvailabilityClient from "./CoachAvailabilityClient"

export const metadata: Metadata = {
  title: "Coach Availability & Booking | Gemini Golf Academy",
  description: "Check the current available time slots for our coaches, to book a lesson at Gemini Golf Academy.",
}

export default function CoachAvailabilityPage() {
  return <CoachAvailabilityClient />
}