import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ApiErrorCode } from '@/src/type/api'
import { formatDuration } from '@/src/utils/time/formatDuration'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const analyzeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'rl:analyze',
})

const saveLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 h'),
  prefix: 'rl:save',
})

export async function proxy(request: NextRequest) {
  if (request.method !== 'POST') return NextResponse.next()

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
          ?? request.headers.get('x-real-ip')
          ?? 'anonymous'

  const path = request.nextUrl.pathname
  const limiter = path.includes('/analyze') ? analyzeLimiter : saveLimiter

  const { success, remaining, reset } = await limiter.limit(ip)

  if (!success) {
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ApiErrorCode.RATE_LIMITED,
          message: `요청이 너무 많습니다. ${formatDuration(retryAfter)} 후 다시 시도해주세요.`,
        },
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  return response
}

export const config = {
  matcher: '/api/:path*',
}
