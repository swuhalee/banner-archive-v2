'use client'

import { useRouter } from 'next/navigation'
import CircularProgress from '@mui/material/CircularProgress'
import { useUpdateReportStatus } from '../_hooks/useUpdateReportStatus'

type Props = {
  reportId: string
  currentStatus: string
}

export default function ReportRowActions({ reportId, currentStatus }: Props) {
  const router = useRouter()
  const { mutate, isPending, variables } = useUpdateReportStatus()

  function handleAction(reportStatus: string) {
    mutate({ reportId, reportStatus }, { onSuccess: () => router.refresh() })
  }

  const isDone = currentStatus === 'actioned' || currentStatus === 'rejected'
  if (isDone) return <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>처리완료</span>

  const pendingStatus = isPending ? variables?.reportStatus : null

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {currentStatus !== 'on_hold' && (
        <button
          className="btn btn-ghost"
          style={{ height: 30, padding: '0 10px', fontSize: 12, color: '#e65100', borderColor: '#ffcc80' }}
          disabled={isPending}
          onClick={() => handleAction('on_hold')}
        >
          {pendingStatus === 'on_hold' && (
            <CircularProgress size={12} color="inherit" style={{ marginRight: 4 }} />
          )}
          보류
        </button>
      )}
      <button
        className="btn btn-ghost"
        style={{ height: 30, padding: '0 10px', fontSize: 12 }}
        disabled={isPending}
        onClick={() => handleAction('rejected')}
      >
        {pendingStatus === 'rejected' && (
          <CircularProgress size={12} color="inherit" style={{ marginRight: 4 }} />
        )}
        반려
      </button>
    </div>
  )
}
