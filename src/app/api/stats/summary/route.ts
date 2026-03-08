import { NextRequest } from 'next/server'
import { unstable_cache } from 'next/cache'
import { and, count, eq, isNotNull, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import db from '@/src/lib/db/db'
import { banners, regions } from '@/src/lib/db/schema'
import { apiSuccess, apiError } from '@/src/lib/api/response'
import { ApiErrorCode } from '@/src/type/api'
import type { SummaryData } from '@/src/type/stats'

// 특정 지역의 현수막만 조회하기 위한 필터 조건
// sido(시도)는 필수, sigungu(시군구)·eupmyeondong(읍면동)은 있을 때만 조건에 추가됨
// 예) sido="경기도", sigungu="수원시" → 경기도 수원시의 활성 현수막만 반환
// Drizzle ORM 전용: db.select().where(여기에 전달) 형태로 사용함
function buildRegionCondition(sido: string, sigungu: string | null, eupmyeondong: string | null) {
  return and(
    eq(banners.status, 'active'),
    eq(regions.sido, sido),
    sigungu ? eq(regions.sigungu, sigungu) : undefined,
    sigungu && eupmyeondong ? eq(regions.eupmyeondong, eupmyeondong) : undefined,
  )
}

// buildRegionCondition과 목적은 같지만, Drizzle ORM이 지원하지 않는 문법(CROSS JOIN unnest 등)을
// 사용하는 Raw SQL 쿼리 안에 직접 삽입하기 위한 SQL 조각을 만듬
// sido가 null이면(전국 조회) 빈 조각을 반환해 조건을 추가 안함
function buildRegionSqlClause(sido: string | null, sigungu: string | null, eupmyeondong: string | null): SQL {
  if (!sido) return sql``
  return sql`
    AND regions.sido = ${sido}
    ${sigungu ? sql`AND regions.sigungu = ${sigungu}` : sql``}
    ${sigungu && eupmyeondong ? sql`AND regions.eupmyeondong = ${eupmyeondong}` : sql``}
  `
}

const getSummaryData = unstable_cache(
  async (sido: string | null, sigungu: string | null, eupmyeondong: string | null): Promise<SummaryData> => {
    const regionJoin = sido ? sql`INNER JOIN regions ON banners.region_id = regions.id` : sql``
    const sqlWhere = buildRegionSqlClause(sido, sigungu, eupmyeondong)
    const joinOn = eq(banners.regionId, regions.id)

    const totalColumns = {
      totalBanners: count(),
      totalObservations: sql<number>`coalesce(sum(${banners.observedCount}), 0)::int`,
      regionCount: sql<number>`count(distinct ${banners.regionId})::int`,
    }
    const totalsQuery = sido
      ? db.select(totalColumns).from(banners).innerJoin(regions, joinOn).where(buildRegionCondition(sido, sigungu, eupmyeondong))
      : db.select(totalColumns).from(banners).where(eq(banners.status, 'active'))

    const hashtagsQuery = db.execute<{ hashtag: string; count: string }>(sql`
      SELECT t.hashtag, COUNT(*) AS count
      FROM banners
      ${regionJoin}
      CROSS JOIN unnest(banners.hashtags) AS t(hashtag)
      WHERE banners.status = 'active'
      ${sqlWhere}
      GROUP BY t.hashtag
      ORDER BY count DESC
      LIMIT 10
    `)

    const subjectQuery = sido
      ? db.select({ type: banners.subjectType, count: count() }).from(banners).innerJoin(regions, joinOn).where(and(buildRegionCondition(sido, sigungu, eupmyeondong), isNotNull(banners.subjectType))).groupBy(banners.subjectType)
      : db.select({ type: banners.subjectType, count: count() }).from(banners).where(and(eq(banners.status, 'active'), isNotNull(banners.subjectType))).groupBy(banners.subjectType)

    const trendQuery = db.execute<{ month: string; count: string }>(sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', banners.first_seen_at), 'YYYY-MM') AS month,
        COUNT(*) AS count
      FROM banners
      ${regionJoin}
      WHERE banners.status = 'active'
        AND banners.first_seen_at >= NOW() - INTERVAL '12 months'
      ${sqlWhere}
      GROUP BY DATE_TRUNC('month', banners.first_seen_at)
      ORDER BY month
    `)

    // max: 1 (serverless 커넥션 제한)로 인해 실제로는 직렬 실행됨
    const [totals] = await totalsQuery
    const hashtagRows = await hashtagsQuery
    const subjectRows = await subjectQuery
    const trendRows = await trendQuery

    return {
      totalBanners: totals?.totalBanners ?? 0,
      totalObservations: totals?.totalObservations ?? 0,
      regionCount: totals?.regionCount ?? 0,
      topHashtags: hashtagRows.map((r) => ({ hashtag: r.hashtag, count: Number(r.count) })),
      subjectTypeDist: subjectRows.map((r) => ({
        type: r.type as SummaryData['subjectTypeDist'][number]['type'],
        count: r.count,
      })),
      monthlyTrend: trendRows.map((r) => ({ month: r.month, count: Number(r.count) })),
    }
  },
  ['stats-summary'],
  { revalidate: 300, tags: ['stats-summary'] },
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const sido = searchParams.get('sido') || null
    const sigungu = searchParams.get('sigungu') || null
    const eupmyeondong = searchParams.get('eupmyeondong') || null

    if (sigungu && !sido) return apiError(ApiErrorCode.BAD_REQUEST, '잘못된 요청입니다.', 400, '"sigungu" query param requires "sido" to be specified')
    if (eupmyeondong && !sigungu) return apiError(ApiErrorCode.BAD_REQUEST, '잘못된 요청입니다.', 400, '"eupmyeondong" query param requires "sigungu" to be specified')

    const data = await getSummaryData(sido, sigungu, eupmyeondong)
    const response = apiSuccess<SummaryData>(data)
    response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return response
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500, e instanceof Error ? e.message : String(e))
  }
}
