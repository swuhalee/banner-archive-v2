import { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import db from '@/src/lib/db/db'
import { banners } from '@/src/lib/db/schema'
import { apiSuccess, apiError } from '@/src/lib/api/response'
import { ApiErrorCode } from '@/src/type/api'

export type RegionLevel = 'sido' | 'sigungu' | 'eupmyeondong'

export type RegionStat = {
  region: string
  count: number
}

const LEVEL_TOKEN_COUNT: Record<RegionLevel, number> = {
  sido: 1,
  sigungu: 2,
  eupmyeondong: 3,
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const level = (searchParams.get('level') ?? 'sido') as RegionLevel
    const tokenCount = LEVEL_TOKEN_COUNT[level] ?? 1

    const rows = await db
      .select({ regionText: banners.regionText })
      .from(banners)
      .where(eq(banners.status, 'active'))

    const counts: Record<string, number> = {}
    for (const { regionText } of rows) {
      const key = regionText.trim().split(/\s+/).slice(0, tokenCount).join(' ')
      if (key) counts[key] = (counts[key] ?? 0) + 1
    }

    const data: RegionStat[] = Object.entries(counts)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)

    return apiSuccess(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : '서버 오류가 발생했습니다.'
    return apiError(ApiErrorCode.INTERNAL_ERROR, message, 500)
  }
}
