import { NextRequest } from 'next/server'
import { and, count, desc, eq, isNotNull, sql } from 'drizzle-orm'
import db from '@/src/lib/db/db'
import { banners, regions } from '@/src/lib/db/schema'
import { apiSuccess, apiError } from '@/src/lib/api/response'
import { ApiErrorCode } from '@/src/type/api'

export type RegionLevel = 'sido' | 'sigungu' | 'eupmyeondong'

export type RegionStat = {
  region: string
  count: number
  lat: number | null
  lng: number | null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const level = (searchParams.get('level') ?? 'sido') as RegionLevel

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

      return apiSuccess(rows satisfies RegionStat[])
    }

    if (level === 'sigungu') {
      const rows = await db
        .select({ sido: regions.sido, sigungu: regions.sigungu, count: count(), lat: latAvg, lng: lngAvg })
        .from(banners)
        .innerJoin(regions, eq(banners.regionId, regions.id))
        .where(and(eq(banners.status, 'active'), isNotNull(regions.sigungu)))
        .groupBy(regions.sido, regions.sigungu)
        .orderBy(desc(count()))

      const data: RegionStat[] = rows.map((r) => ({
        region: `${r.sido} ${r.sigungu}`,
        count: r.count,
        lat: r.lat,
        lng: r.lng,
      }))
      return apiSuccess(data)
    }

    // eupmyeondong
    const rows = await db
      .select({ sido: regions.sido, sigungu: regions.sigungu, eupmyeondong: regions.eupmyeondong, count: count(), lat: latAvg, lng: lngAvg })
      .from(banners)
      .innerJoin(regions, eq(banners.regionId, regions.id))
      .where(and(eq(banners.status, 'active'), isNotNull(regions.eupmyeondong)))
      .groupBy(regions.sido, regions.sigungu, regions.eupmyeondong)
      .orderBy(desc(count()))

    const data: RegionStat[] = rows.map((r) => ({
      region: [r.sido, r.sigungu, r.eupmyeondong].filter(Boolean).join(' '),
      count: r.count,
      lat: r.lat,
      lng: r.lng,
    }))
    return apiSuccess(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : '서버 오류가 발생했습니다.'
    return apiError(ApiErrorCode.INTERNAL_ERROR, message, 500)
  }
}
