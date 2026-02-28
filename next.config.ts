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
};

export default nextConfig;
