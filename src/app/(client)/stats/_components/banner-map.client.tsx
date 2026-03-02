'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import BannerMapSkeleton from './banner-map.skeleton'
import type { SummaryScope } from '@/src/type/stats'
import SummarySection from './summary-section'

const BannerMapDynamic = dynamic(() => import('./banner-map'), {
  ssr: false,
  loading: () => <BannerMapSkeleton />,
})

export default function BannerMap() {
  const [selectedRegion, setSelectedRegion] = useState<SummaryScope>(null)

  function handleSelectRegion(region: NonNullable<SummaryScope>) {
    setSelectedRegion((prev) => {
      if (
        prev?.sido === region?.sido &&
        prev?.sigungu === region?.sigungu &&
        prev?.eupmyeondong === region?.eupmyeondong
      ) return null
      return region
    })
  }

  return (
    <>
      <BannerMapDynamic onSelectRegion={handleSelectRegion} selectedRegion={selectedRegion} />

      {selectedRegion && (
        <div style={{ animation: 'summary-panel-in 0.2s ease' }}>
          <SummarySection scope={selectedRegion} onClose={() => setSelectedRegion(null)} />
        </div>
      )}
    </>
  )
}
