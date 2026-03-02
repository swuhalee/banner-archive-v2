'use client'

import dynamic from 'next/dynamic'
import BannerMapSkeleton from './banner-map.skeleton'

const BannerMap = dynamic(() => import('./banner-map'), {
    ssr: false,
    loading: () => <BannerMapSkeleton />,
})

export default BannerMap
