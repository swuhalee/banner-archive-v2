'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BannerModal from '@/src/app/(client)/banner/_components/banner-modal'

function BannerModalIntercepted() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  return (
    <BannerModal
      bannerId={id}
      open={true}
      onClose={() => router.back()}
    />
  )
}

export default function Page() {
  return (
    <Suspense>
      <BannerModalIntercepted />
    </Suspense>
  )
}
