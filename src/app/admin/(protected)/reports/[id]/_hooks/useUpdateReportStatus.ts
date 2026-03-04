'use client'

import { useMutation } from '@tanstack/react-query'
import type { ApiResponse } from '@/src/type/api'
import type { UpdateReportStatusInput } from '@/src/type/admin'

async function updateReportStatus({ reportId, reportStatus, bannerStatus }: UpdateReportStatusInput): Promise<void> {
  const res = await fetch(`/api/admin/reports/${reportId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportStatus, bannerStatus: bannerStatus ?? null }),
  })
  const json: ApiResponse<unknown> = await res.json()
  if (!json.success) throw new Error(json.error.message)
}

export function useUpdateReportStatus() {
  return useMutation({ mutationFn: updateReportStatus })
}
