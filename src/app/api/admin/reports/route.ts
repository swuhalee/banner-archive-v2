import { NextRequest } from 'next/server'
import { getAdminReports } from '@/src/lib/api/report'
import { apiSuccess, apiError } from '@/src/lib/api/response'
import { ApiErrorCode } from '@/src/type/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') as 'received' | 'on_hold' | 'actioned' | 'rejected' | null
    const page = searchParams.has('page') ? Number(searchParams.get('page')) : 1
    const limit = searchParams.has('limit') ? Number(searchParams.get('limit')) : 20

    const data = await getAdminReports({ status: status ?? undefined, page, limit })
    return apiSuccess(data)
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500, e instanceof Error ? e.message : String(e))
  }
}
