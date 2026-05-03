import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://mailpilot.shubhojeet.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/inbox/", "/sent/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
