import { env } from "@/lib/env";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/profile/", "/api/", "/checkout/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
