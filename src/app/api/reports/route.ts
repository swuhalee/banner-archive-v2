import { NextRequest } from 'next/server'
import { createReport } from '@/src/lib/api/report'
import { apiSuccess, apiError } from '@/src/lib/api/response'
import { ApiErrorCode, ApiSuccessCode } from '@/src/type/api'
import { CreateReportSchema } from '@/src/lib/validation/report'

export async function POST(request: NextRequest) {
    try {
        const parsed = CreateReportSchema.safeParse(await request.json())

        if (!parsed.success) {
            const message = parsed.error.issues[0]?.message ?? '잘못된 요청입니다.'
            return apiError(ApiErrorCode.BAD_REQUEST, message)
        }

        const report = await createReport(parsed.data)
        return apiSuccess(report, ApiSuccessCode.CREATED, 201)
    } catch (e) {
        const message = e instanceof Error ? e.message : '서버 오류가 발생했습니다.'
        return apiError(ApiErrorCode.INTERNAL_ERROR, message, 500)
    }
}
