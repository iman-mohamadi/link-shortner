import type { MetadataRoute } from "next"

const BASE = "https://rizo.link"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url:             `${BASE}/`,
      lastModified:    new Date(),
      changeFrequency: "weekly",
      priority:        1.0,
    },
    {
      url:             `${BASE}/pricing`,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.9,
    },
    {
      url:             `${BASE}/auth`,
      lastModified:    new Date(),
      changeFrequency: "yearly",
      priority:        0.5,
    },
  ]
}
