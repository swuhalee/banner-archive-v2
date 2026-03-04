import { redirect } from 'next/navigation'
import { getAdminSession } from '@/src/lib/auth/session'
import AdminNav from './_components/admin-nav'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()
  if (!session.user) {
    redirect('/admin/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <AdminNav />
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
