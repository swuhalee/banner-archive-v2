import type { MetadataRoute } from "next";

function getSiteUrl(): string {
  return (process.env.NEXTAUTH_URL!).replace(/\/+$/, "");
}

function getAdminPublicPath(): string {
  const rawPath = process.env.NEXT_PUBLIC_ADMIN_PATH?.trim();
  if (!rawPath) return "/secret-dashboard";

  const withLeadingSlash = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const normalized = withLeadingSlash.length > 1
    ? withLeadingSlash.replace(/\/+$/, "")
    : withLeadingSlash;

  if (normalized === "/" || normalized === "/admin") return "/secret-dashboard";
  return normalized;
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const adminPublicPath = getAdminPublicPath();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/admin/", `${adminPublicPath}/`, adminPublicPath],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
