import { getAdminSession } from '@/src/lib/auth/session'
import { apiSuccess } from '@/src/lib/api/response'

export async function POST() {
  const session = await getAdminSession()
  session.destroy()
  return apiSuccess({ ok: true })
}
