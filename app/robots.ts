import type { MetadataRoute } from "next"
import { site } from "@/content/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/portal", "/api", "/auth"] },
    sitemap: `${site.url}/sitemap.xml`,
  }
}
