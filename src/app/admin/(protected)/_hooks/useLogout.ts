'use client'

import { useMutation } from '@tanstack/react-query'
import type { ApiResponse } from '@/src/type/api'

async function logout(): Promise<void> {
  const res = await fetch('/api/admin/auth/logout', { method: 'POST' })
  const json: ApiResponse<unknown> = await res.json()
  if (!json.success) throw new Error(json.error.message)
}

export function useLogout() {
  return useMutation({ mutationFn: logout })
}
