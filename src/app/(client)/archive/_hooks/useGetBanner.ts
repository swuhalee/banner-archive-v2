import { useQuery } from '@tanstack/react-query'
import type { BannerWithImage } from '@/src/type/banner'
import type { ApiResponse } from '@/src/type/api'

async function fetchBanner(id: string): Promise<BannerWithImage> {
  const res = await fetch(`/api/banners/${id}`)
  if (!res.ok && !res.headers.get('content-type')?.includes('application/json')) {
    throw new Error('서버와 통신할 수 없습니다.')
  }
  const json: ApiResponse<BannerWithImage> = await res.json()
  if (!json.success) throw new Error(json.error.message)
  return json.data
}

export function useGetBanner(id: string | null) {
  return useQuery({
    queryKey: ['banner', id],
    queryFn: () => fetchBanner(id!),
    enabled: !!id,
  })
}
