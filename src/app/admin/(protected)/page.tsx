import { getAdminSession } from '@/src/lib/auth/session'

export default async function Page() {
  const session = await getAdminSession()
  const { name, role } = session.user!

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-strong)', margin: '0 0 6px' }}>
        관리자 대시보드
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{name}</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--accent)',
            border: '1px solid var(--accent)',
            borderRadius: 6,
            padding: '2px 8px',
          }}
        >
          {role}
        </span>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
        신고 관리 및 배너 검수 기능은 순차적으로 추가될 예정입니다.
      </p>
    </div>
  )
}
