import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { RegionItem } from '@/src/app/api/regions/route'
import type { ApiResponse } from '@/src/type/api'

async function fetchRegions(parentId?: number): Promise<RegionItem[]> {
  const url = parentId != null ? `/api/regions?parentId=${parentId}` : '/api/regions'
  const res = await fetch(url)

  if (!res.ok && !res.headers.get('content-type')?.includes('application/json')) {
    throw new Error('서버와 통신할 수 없습니다.')
  }

  const json: ApiResponse<RegionItem[]> = await res.json()
  if (!json.success) throw new Error(json.error.message)
  return json.data ?? []
}

export function useGetRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: () => fetchRegions(),
  })
}

export function useGetRegionChildren() {
  const queryClient = useQueryClient()

  return (parentId: number) =>
    queryClient.fetchQuery({
      queryKey: ['regions', parentId],
      queryFn: () => fetchRegions(parentId),
    })
}
