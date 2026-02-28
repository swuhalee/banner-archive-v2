import { useInfiniteQuery } from '@tanstack/react-query'
import type { BannerWithImage, BannerListParams } from '@/src/type/banner'
import type { ApiResponse } from '@/src/type/api'

const LIMIT = 20

async function fetchBanners(params: BannerListParams): Promise<BannerWithImage[]> {
  const searchParams = new URLSearchParams()
  searchParams.set('page', String(params.page ?? 1))
  searchParams.set('limit', String(params.limit ?? LIMIT))
  if (params.status) searchParams.set('status', params.status)
  if (params.subjectType) searchParams.set('subjectType', params.subjectType)
  if (params.regionText) searchParams.set('regionText', params.regionText)
  if (params.sort) searchParams.set('sort', params.sort)

  const res = await fetch(`/api/banners?${searchParams.toString()}`)
  if (!res.ok && !res.headers.get('content-type')?.includes('application/json')) {
    throw new Error('서버와 통신할 수 없습니다.')
  }
  const json: ApiResponse<BannerWithImage[]> = await res.json()
  if (!json.success) throw new Error(json.error.message)
  return json.data
}

export function useGetBanners(filters: Pick<BannerListParams, 'status' | 'subjectType' | 'regionText' | 'sort'> = {}) {
  return useInfiniteQuery({
    queryKey: ['banners', filters],
    queryFn: ({ pageParam }) => fetchBanners({ ...filters, page: pageParam, limit: LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      // 마지막 페이지 항목 수가 limit보다 적으면 다음 페이지 없음
      if (lastPage.length < LIMIT) return undefined
      return lastPageParam + 1
    },
  })
}
