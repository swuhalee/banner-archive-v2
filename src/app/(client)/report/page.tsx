'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReportModal from './_components/report-modal';

function ReportPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const from = searchParams.get('from') ?? '/archive'

  return (
    <ReportModal
      bannerId={id}
      open={true}
      onClose={() => router.replace(from)}
    />
  )
}

export default function Page() {
  return (
    <Suspense>
      <ReportPageContent />
    </Suspense>
  )
}
