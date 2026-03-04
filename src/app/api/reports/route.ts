import { NextRequest } from 'next/server'
import { createReport } from '@/src/lib/api/report'
import { apiSuccess, apiError } from '@/src/lib/api/response'
import { ApiErrorCode, ApiSuccessCode } from '@/src/type/api'
import { CreateReportSchema } from '@/src/lib/validation/report'

export async function POST(request: NextRequest) {
  try {
    const parsed = CreateReportSchema.safeParse(await request.json())

    if (!parsed.success) {
      return apiError(ApiErrorCode.BAD_REQUEST, '잘못된 요청입니다.', 400, JSON.stringify(parsed.error.issues))
    }

    const report = await createReport(parsed.data)
    if (!report) return apiError(ApiErrorCode.BAD_REQUEST, '신고할 수 없는 현수막입니다.', 400)
    return apiSuccess(report, ApiSuccessCode.CREATED, 201)
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500, e instanceof Error ? e.message : String(e))
  }
}
