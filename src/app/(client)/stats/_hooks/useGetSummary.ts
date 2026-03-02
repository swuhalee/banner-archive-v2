import { useQuery } from '@tanstack/react-query'
import type { SummaryData, SummaryScope } from '@/src/type/stats'
import type { ApiResponse } from '@/src/type/api'

async function fetchSummary(scope: SummaryScope): Promise<SummaryData> {
  const params = new URLSearchParams()
  if (scope) {
    params.set('sido', scope.sido)
    if (scope.sigungu) params.set('sigungu', scope.sigungu)
    if (scope.eupmyeondong) params.set('eupmyeondong', scope.eupmyeondong)
  }

  const url = `/api/stats/summary${scope ? `?${params.toString()}` : ''}`
  const res = await fetch(url)

  if (!res.ok && !res.headers.get('content-type')?.includes('application/json')) {
    throw new Error('서버와 통신할 수 없습니다.')
  }

  const json: ApiResponse<SummaryData> = await res.json()
  if (!json.success) throw new Error(json.error.message)
  return json.data
}

export function useGetSummary(scope: SummaryScope) {
  return useQuery({
    queryKey: ['banner-summary', scope?.sido ?? null, scope?.sigungu ?? null, scope?.eupmyeondong ?? null],
    queryFn: () => fetchSummary(scope),
  })
}
