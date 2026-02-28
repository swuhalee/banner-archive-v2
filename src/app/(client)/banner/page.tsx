'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BannerModal from './_components/banner-modal'

function BannerPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const from = searchParams.get('from') ?? '/archive'

  return (
    <BannerModal
      bannerId={id}
      open={true}
      onClose={() => router.push(from)}
    />
  )
}

export default function Page() {
  return (
    <Suspense>
      <BannerPageContent />
    </Suspense>
  )
}
