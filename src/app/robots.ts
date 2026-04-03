import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup"],
        disallow: ["/dashboard/", "/onboarding/", "/api/"],
      },
    ],
    sitemap: "https://pinpoint.study/sitemap.xml",
  };
}
