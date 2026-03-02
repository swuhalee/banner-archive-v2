import { useQuery } from '@tanstack/react-query'
import type { RegionLevel, RegionStat } from '@/src/type/stats'
import type { ApiResponse } from '@/src/type/api'

async function fetchBannerStats(level: RegionLevel): Promise<RegionStat[]> {
  const res = await fetch(`/api/stats/banners?level=${level}`)
  if (!res.ok && !res.headers.get('content-type')?.includes('application/json')) {
    throw new Error('서버와 통신할 수 없습니다.')
  }

  const json: ApiResponse<RegionStat[]> = await res.json()
  if (!json.success) throw new Error(json.error.message)
  return json.data
}

export function useGetBannerStats(level: RegionLevel) {
  return useQuery({
    queryKey: ['banner-stats', level],
    queryFn: () => fetchBannerStats(level),
  })
}
