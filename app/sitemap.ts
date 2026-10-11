import type { MetadataRoute } from "next"
import { site } from "@/content/site"

/** Public pages only. /receptionist is the team-only demo portal, so it's left out on purpose. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/luke`, changeFrequency: "monthly", priority: 0.6 },
  ]
}
