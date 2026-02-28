import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getBanners } from '@/src/lib/api/banner'
import ArchiveBannerList from './_components/archive-banner-list'

const LIMIT = 20

async function Page() {
  const queryClient = new QueryClient()

  // 서버에서 첫 페이지를 직접 DB 조회 → 클라이언트에 hydration
  // dehydrate: 탈수 -> 서버에서 미리 데이터를 가져와서 HTML에 포함시키는 과정
  //   서버                                  클라이언트
  // ─────                                 ──────────
  // QueryClient → dehydrate() → JSON  →  HydrationBoundary → QueryClient
  // (살아있음)      (탈수)         (전송)     (수분 공급)          (살아있음)
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['banners', {}],
    queryFn: ({ pageParam }) => getBanners({ page: pageParam as number, limit: LIMIT }),
    initialPageParam: 1,
  })

  return (
    // hydration: 수분 공급 -> 클라이언트에서 서버가 보낸 데이터를 다시 활성화하는 과정
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ArchiveBannerList />
    </HydrationBoundary>
  )
}

export default Page