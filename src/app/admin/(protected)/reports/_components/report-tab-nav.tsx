'use client'

import Link from 'next/link'

const STATUS_TABS = [
  { value: '', label: '전체' },
  { value: 'received', label: '접수됨' },
  { value: 'on_hold', label: '보류' },
  { value: 'actioned', label: '처리완료' },
  { value: 'rejected', label: '반려' },
] as const

export default function ReportTabNav({ status }: { status?: string }) {
  const current = status ?? ''

  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', marginBottom: 16 }}>
      {STATUS_TABS.map(({ value, label }) => {
        const isActive = current === value
        return (
          <Link
            key={value}
            href={value ? `/admin/reports?status=${value}` : '/admin/reports'}
            style={{
              display: 'inline-block',
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--text-strong)' : 'var(--text-muted)',
              borderBottom: isActive ? '2px solid var(--text-strong)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
