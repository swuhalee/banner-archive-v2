'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useGetBanners } from '../_hooks/useGetBanners'
import PhotoCard from './photo-card'
import { SUBJECT_TYPE_LABEL } from '@/src/type/banner'
import type { SubjectType, BannerSortOption } from '@/src/type/banner'
import { useToast } from '@/src/providers/toast-provider'

export default function ArchiveBannerList() {
  const [regionText, setRegionText] = useState('')
  const [regionSearch, setRegionSearch] = useState('')
  const [subjectType, setSubjectType] = useState<SubjectType | ''>('')
  const [sort, setSort] = useState<BannerSortOption>('recent')

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useGetBanners({
    ...(regionSearch && { regionText: regionSearch }),
    ...(subjectType && { subjectType }),
    sort,
  })

  const { ref: sentinelRef, inView } = useInView({ threshold: 0 })
  const { showError } = useToast()

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    if (!isError) return
    showError(error instanceof Error ? error.message : '목록을 불러오지 못했습니다.')
  }, [isError, error, showError])

  const banners = data?.pages.flat() ?? []

  return (
    <>
      <div className="stack-lg">
        <section className="grid grid-cols-[1fr_1fr_2fr] gap-2 pb-2.5 max-[1024px]:grid-cols-1">
          <select value={sort} onChange={(e) => setSort(e.target.value as BannerSortOption)}>
            <option value="recent">최근 관측순</option>
            <option value="first">최초 관측순</option>
            <option value="count">관측 횟수순</option>
          </select>

          <select
            value={subjectType}
            onChange={(e) => setSubjectType(e.target.value as SubjectType | '')}
          >
            <option value="">주체 전체</option>
            {Object.entries(SUBJECT_TYPE_LABEL).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="지역 검색"
              value={regionText}
              onChange={(e) => setRegionText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setRegionSearch(regionText) }}
              className="flex-1"
            />
            <button type="button" className="btn btn-solid" onClick={() => setRegionSearch(regionText)}>
              검색
            </button>
          </div>
        </section>

        {isLoading ? (
          <p className="text-(--text-muted) text-sm">불러오는 중...</p>
        ) : banners.length === 0 ? (
          <p className="text-(--text-muted) text-sm">등록된 현수막이 없습니다.</p>
        ) : (
          <div className="masonry">
            {banners.map((banner) => (
              <PhotoCard
                key={banner.id}
                item={banner}
                fromPath="/archive"
              />
            ))}
          </div>
        )}

        {/* 무한 스크롤 sentinel: 뷰포트에 들어오면 다음 페이지 로드 */}
        <div ref={sentinelRef} aria-hidden />

        {isFetchingNextPage && (
          <p className="text-(--text-muted) text-sm text-center py-4">더 불러오는 중...</p>
        )}

      </div>

    </>
  )
}
