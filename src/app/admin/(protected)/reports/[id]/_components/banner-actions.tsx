'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import CircularProgress from '@mui/material/CircularProgress'
import type { ApiResponse } from '@/src/type/api'

async function hideBanner(bannerId: string): Promise<void> {
  const res = await fetch(`/api/admin/banners/${bannerId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'hidden' }),
  })
  const json: ApiResponse<unknown> = await res.json()
  if (!json.success) throw new Error(json.error.message)
}

type Props = {
  bannerId: string
  currentStatus: string
}

export default function BannerActions({ bannerId, currentStatus }: Props) {
  const router = useRouter()
  const { mutate, isPending } = useMutation({
    mutationFn: () => hideBanner(bannerId),
    onSuccess: () => router.refresh(),
  })

  if (currentStatus === 'hidden' || currentStatus === 'deleted') {
    return null
  }

  return (
    <button
      className="btn btn-solid"
      style={{
        height: 'auto',
        padding: '6px 10px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        background: '#c62828',
        borderColor: '#c62828',
      }}
      disabled={isPending}
      onClick={() => mutate()}
    >
      {isPending && <CircularProgress size={10} color="inherit" style={{ marginRight: 4 }} />}
      배너 숨김
    </button>
  )
}
