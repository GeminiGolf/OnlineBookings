import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/MeetOurCoaches",
        "/CoachAvailability",
        "/login",
        "/signup",
      ],
      disallow: [
        "/admin/",
        "/api/",
        "/auth/",
        "/client/",
        "/coach/",
        "/forgot-password/",
        "/reset-password/",
      ],
    },
    sitemap: "https://www.geminigolfacademy.com/sitemap.xml",
  }
}