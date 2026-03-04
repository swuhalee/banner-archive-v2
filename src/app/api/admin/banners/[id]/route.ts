import { NextRequest } from 'next/server'
import { updateBannerStatus, bulkActionReportsByBannerId } from '@/src/lib/api/report'
import { apiSuccess, apiError } from '@/src/lib/api/response'
import { ApiErrorCode } from '@/src/type/api'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status } = await request.json()

    const VALID = ['active', 'hidden', 'deleted'] as const
    if (!VALID.includes(status)) {
      return apiError(ApiErrorCode.BAD_REQUEST, '유효하지 않은 상태값입니다.', 400)
    }

    if (status === 'hidden' || status === 'deleted') {
      await Promise.all([
        updateBannerStatus(id, status),
        bulkActionReportsByBannerId(id),
      ])
    } else {
      await updateBannerStatus(id, status)
    }
    return apiSuccess({ ok: true })
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500, e instanceof Error ? e.message : String(e))
  }
}
