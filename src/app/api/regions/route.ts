import { NextRequest } from 'next/server'
import { unstable_cache } from 'next/cache'
import { asc, eq, isNull } from 'drizzle-orm'
import db from '@/src/lib/db/db'
import { regions } from '@/src/lib/db/schema'
import { apiSuccess, apiError } from '@/src/lib/api/response'
import { ApiErrorCode } from '@/src/type/api'

export type RegionItem = {
  id: number
  name: string
  kind: string
  lat: number | null
  lng: number | null
  fullPath: string
}

const getRegions = unstable_cache(
  async (parentId: number | null) => {
    return db
      .select({
        id: regions.id,
        name: regions.name,
        kind: regions.kind,
        lat: regions.lat,
        lng: regions.lng,
        fullPath: regions.fullPath,
      })
      .from(regions)
      .where(parentId !== null ? eq(regions.parentId, parentId) : isNull(regions.parentId))
      .orderBy(asc(regions.name))
  },
  ['regions'],
  { revalidate: 3600, tags: ['regions'] },
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const parentIdParam = searchParams.get('parentId')
    const parentId = parentIdParam !== null ? Number(parentIdParam) : null

    if (parentIdParam !== null && (isNaN(parentId!) || parentId! <= 0)) {
      return apiError(ApiErrorCode.BAD_REQUEST, '유효하지 않은 parentId입니다.', 400, `parentId must be a positive integer, received: "${parentIdParam}"`)
    }

    const rows = await getRegions(parentId)
    const response = apiSuccess(rows)
    // 지역 데이터는 거의 변경되지 않으므로 브라우저, CDN 모두 캐싱 허용
    // stats api는 배너 추가 시 stale 방지를 위해 s-maxage만 사용
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400')
    return response
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500, e instanceof Error ? e.message : String(e))
  }
}
