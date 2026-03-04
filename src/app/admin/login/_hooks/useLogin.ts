'use client'

import { useMutation } from '@tanstack/react-query'
import type { ApiResponse } from '@/src/type/api'
import type { LoginInput } from '@/src/type/admin'

async function login(input: LoginInput): Promise<void> {
  const res = await fetch('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  const json: ApiResponse<unknown> = await res.json()
  if (!json.success) throw new Error(json.error.message)
}

export function useLogin() {
  return useMutation({ mutationFn: login })
}
