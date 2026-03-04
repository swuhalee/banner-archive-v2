import type { NextConfig } from "next";

function getHostname(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const envHostnames = [
  getHostname(process.env.NEXT_PUBLIC_SUPABASE_URL),
  getHostname(process.env.SUPABASE_URL),
].filter((hostname): hostname is string => Boolean(hostname));

function getAdminPublicPath(): string {
  const rawPath = process.env.NEXT_PUBLIC_ADMIN_PATH?.trim()
  if (!rawPath) return '/secret-dashboard'

  const withLeadingSlash = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
  const normalized = withLeadingSlash.length > 1
    ? withLeadingSlash.replace(/\/+$/, '')
    : withLeadingSlash

  if (normalized === '/admin' || normalized === '/') return '/secret-dashboard'
  return normalized
}

const adminPublicPath = getAdminPublicPath()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.storage.supabase.co',
      },
      ...envHostnames.map((hostname) => ({
        protocol: 'https' as const,
        hostname,
      })),
    ],
  },
  async rewrites() {
    return [
      { source: adminPublicPath, destination: '/admin' },
      { source: `${adminPublicPath}/:path*`, destination: '/admin/:path*' },
    ]
  },
};

export default nextConfig;
