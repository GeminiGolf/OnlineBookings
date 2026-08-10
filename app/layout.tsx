import type { Metadata } from "next"

import {
  Geist,
  Geist_Mono,
} from "next/font/google"

import "./globals.css"

import Navbar
  from "@/components/navbar/Navbar"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Gemini Golf",
  description:
    "Golf Lesson Booking Platform",

  manifest: "/manifest.json",

  applicationName: "Gemini Golf",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gemini Golf",
  },

  formatDetection: {
    telephone: false,
  },

  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },

  other: {
    "mobile-web-app-capable": "yes",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (

    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >

      <body className="overflow-x-hidden bg-[#1B2E23] text-white">

        <Navbar />

        <div
          id="site-wrapper"
          className="min-h-screen w-full transition-[margin,width] duration-300 ease-in-out"
        >
          {children}
        </div>

      </body>

    </html>
  )
}