'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReportModal from '../../report/_components/report-modal';

function PageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const id = searchParams.get('id')

    return (
        <ReportModal
            bannerId={id}
            open={true}
            onClose={() => router.back()}
        />
    )
}

export default function Page() {
    return (
        <Suspense>
            <PageContent />
        </Suspense>
    )
}
