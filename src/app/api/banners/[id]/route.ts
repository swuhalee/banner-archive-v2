import { NextRequest } from 'next/server'
import { getBannerById } from '@/src/lib/api/banner'
import { apiSuccess, apiError } from '@/src/lib/api/response'
import { ApiErrorCode } from '@/src/type/api'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const banner = await getBannerById(id)
    if (!banner) return apiError(ApiErrorCode.NOT_FOUND, '배너를 찾을 수 없습니다.', 404, `Banner with id "${id}" not found in database`)
    return apiSuccess(banner)
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500, e instanceof Error ? e.message : String(e));
  }
}
