'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import { useLogin } from './_hooks/useLogin'
import { ADMIN_PUBLIC_PATH } from '@/src/lib/auth/admin-path'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromParam = searchParams.get('from')
  const from = fromParam && fromParam.startsWith(ADMIN_PUBLIC_PATH) ? fromParam : ADMIN_PUBLIC_PATH

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { mutate: login, isPending, error } = useLogin()

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    login(
      { email, password },
      { onSuccess: () => router.replace(from) },
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 16,
          padding: 32,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-strong)', margin: '0 0 4px' }}>
          관리자 로그인
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px' }}>
          한국 현수막 저장소 운영자 전용
        </p>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              placeholder="admin@example.com"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-solid"
            disabled={isPending}
            style={{ width: '100%', marginTop: 4, height: 44 }}
          >
            {isPending ? <CircularProgress size={18} color="inherit" /> : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
