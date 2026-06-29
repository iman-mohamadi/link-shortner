import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:  "/",
        disallow: ["/dashboard", "/create", "/analytics", "/api/"],
      },
    ],
    sitemap: "https://rizo.link/sitemap.xml",
    host:    "https://rizo.link",
  }
}
