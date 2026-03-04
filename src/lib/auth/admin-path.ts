const DEFAULT_ADMIN_PUBLIC_PATH = '/secret-dashboard'

function normalizeAdminPath(path?: string): string {
  if (!path) return DEFAULT_ADMIN_PUBLIC_PATH

  const trimmed = path.trim()
  if (!trimmed) return DEFAULT_ADMIN_PUBLIC_PATH

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  const normalized = withLeadingSlash.length > 1
    ? withLeadingSlash.replace(/\/+$/, '')
    : withLeadingSlash

  // Internal route name is reserved for rewrites.
  if (normalized === '/admin' || normalized === '/') return DEFAULT_ADMIN_PUBLIC_PATH
  return normalized
}

export const ADMIN_PUBLIC_PATH = normalizeAdminPath(process.env.NEXT_PUBLIC_ADMIN_PATH)
export const ADMIN_LOGIN_PATH = `${ADMIN_PUBLIC_PATH}/login`

export function toAdminPath(path = ''): string {
  if (!path) return ADMIN_PUBLIC_PATH
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${ADMIN_PUBLIC_PATH}${suffix}`
}

export function isAdminPublicPathname(pathname: string): boolean {
  return pathname === ADMIN_PUBLIC_PATH || pathname.startsWith(`${ADMIN_PUBLIC_PATH}/`)
}

