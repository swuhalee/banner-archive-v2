import { NextRequest } from 'next/server'
import { unstable_cache } from 'next/cache'
import { and, count, desc, eq, isNotNull, sql } from 'drizzle-orm'
import db from '@/src/lib/db/db'
import { banners, regions } from '@/src/lib/db/schema'
import { apiSuccess, apiError } from '@/src/lib/api/response'
import { ApiErrorCode } from '@/src/type/api'
import type { RegionLevel, RegionStat } from '@/src/type/stats'

const getBannersStatData = unstable_cache(
  async (level: RegionLevel): Promise<RegionStat[]> => {
    const latAvg = sql<number | null>`avg(${regions.lat})::float`
    const lngAvg = sql<number | null>`avg(${regions.lng})::float`

    if (level === 'sido') {
      const rows = await db
        .select({ region: regions.sido, count: count(), lat: latAvg, lng: lngAvg })
        .from(banners)
        .innerJoin(regions, eq(banners.regionId, regions.id))
        .where(eq(banners.status, 'active'))
        .groupBy(regions.sido)
        .orderBy(desc(count()))

      return rows.map((r) => ({
        region: r.region,
        count: r.count,
        lat: r.lat,
        lng: r.lng,
        sido: r.region,
        sigungu: null,
        eupmyeondong: null,
      }))
    }

    if (level === 'sigungu') {
      const rows = await db
        .select({ sido: regions.sido, sigungu: regions.sigungu, count: count(), lat: latAvg, lng: lngAvg })
        .from(banners)
        .innerJoin(regions, eq(banners.regionId, regions.id))
        .where(and(eq(banners.status, 'active'), isNotNull(regions.sigungu)))
        .groupBy(regions.sido, regions.sigungu)
        .orderBy(desc(count()))

      return rows.map((r) => ({
        region: `${r.sido} ${r.sigungu}`,
        count: r.count,
        lat: r.lat,
        lng: r.lng,
        sido: r.sido,
        sigungu: r.sigungu,
        eupmyeondong: null,
      }))
    }

    // eupmyeondong
    const rows = await db
      .select({ sido: regions.sido, sigungu: regions.sigungu, eupmyeondong: regions.eupmyeondong, count: count(), lat: latAvg, lng: lngAvg })
      .from(banners)
      .innerJoin(regions, eq(banners.regionId, regions.id))
      .where(and(eq(banners.status, 'active'), isNotNull(regions.eupmyeondong)))
      .groupBy(regions.sido, regions.sigungu, regions.eupmyeondong)
      .orderBy(desc(count()))

    return rows.map((r) => ({
      region: [r.sido, r.sigungu, r.eupmyeondong].filter(Boolean).join(' '),
      count: r.count,
      lat: r.lat,
      lng: r.lng,
      sido: r.sido,
      sigungu: r.sigungu,
      eupmyeondong: r.eupmyeondong,
    }))
  },
  ['stats-banners'],
  { revalidate: 300, tags: ['stats-banners'] },
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const level = (searchParams.get('level') ?? 'sido') as RegionLevel

    const data = await getBannersStatData(level)
    const response = apiSuccess(data)
    response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return response
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500, e instanceof Error ? e.message : String(e))
  }
}
