import { NextRequest } from 'next/server'
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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const parentIdParam = searchParams.get('parentId')
        const parentId = parentIdParam !== null ? Number(parentIdParam) : null

        if (parentIdParam !== null && (isNaN(parentId!) || parentId! <= 0)) {
            return apiError(ApiErrorCode.BAD_REQUEST, '유효하지 않은 parentId입니다.')
        }

        const rows = await db
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

        return apiSuccess(rows)
    } catch (e) {
        return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500)
    }
}
