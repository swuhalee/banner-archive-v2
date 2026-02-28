'use client'

import { useMutation } from '@tanstack/react-query'
import type { CreateReportRequest } from '@/src/type/report'
import type { ApiResponse } from '@/src/type/api'

async function submitReport(input: CreateReportRequest): Promise<void> {
    const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    })

    const json: ApiResponse<unknown> = await res.json()
    if (!json.success) throw new Error(json.error.message)
}

export function useSubmitReport() {
    return useMutation({ mutationFn: submitReport })
}
