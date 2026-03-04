import { NextRequest } from 'next/server'
import { updateReportStatus, updateBannerStatus, bulkActionReportsByBannerId, getAdminReportById } from '@/src/lib/api/report'
import { apiSuccess, apiError } from '@/src/lib/api/response'
import { ApiErrorCode } from '@/src/type/api'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { reportStatus, bannerStatus } = await request.json()

    const VALID_REPORT_STATUS = ['received', 'on_hold', 'actioned', 'rejected'] as const
    const VALID_BANNER_STATUS = ['active', 'hidden', 'deleted'] as const

    if (bannerStatus && !VALID_BANNER_STATUS.includes(bannerStatus)) {
      return apiError(ApiErrorCode.BAD_REQUEST, '유효하지 않은 배너 상태값입니다.', 400)
    }
    if (!bannerStatus && !VALID_REPORT_STATUS.includes(reportStatus)) {
      return apiError(ApiErrorCode.BAD_REQUEST, '유효하지 않은 신고 상태값입니다.', 400)
    }

    const report = await getAdminReportById(id)
    if (!report) {
      return apiError(ApiErrorCode.NOT_FOUND, '신고를 찾을 수 없습니다.', 404)
    }

    if (bannerStatus && report.bannerId) {
      await Promise.all([
        bulkActionReportsByBannerId(report.bannerId),
        updateBannerStatus(report.bannerId, bannerStatus),
      ])
    } else {
      await updateReportStatus(id, reportStatus)
    }

    return apiSuccess({ ok: true })
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500, e instanceof Error ? e.message : String(e))
  }
}
