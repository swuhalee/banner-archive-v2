'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLogout } from '../_hooks/useLogout'

const navItems = [
  { label: '대시보드', href: '/admin', exact: true },
  { label: '신고 관리', href: '/admin/reports', exact: false },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { mutate: logout } = useLogout()

  return (
    <nav
      style={{
        width: 200,
        flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid var(--line)' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
          현수막 저장소 관리
        </span>
      </div>

      <div style={{ flex: 1, padding: '8px' }}>
        {navItems.map(({ label, href, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'block',
                padding: '8px 10px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--text-strong)' : 'var(--text)',
                background: isActive ? 'var(--surface-alt)' : 'transparent',
                marginBottom: 2,
              }}
            >
              {label}
            </Link>
          )
        })}
      </div>

      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--line)' }}>
        <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => logout(undefined, { onSuccess: () => router.replace('/admin/login') })}>
          로그아웃
        </button>
      </div>
    </nav>
  )
}
