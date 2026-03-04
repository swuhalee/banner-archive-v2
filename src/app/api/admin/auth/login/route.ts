import { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import db from '@/src/lib/db/db'
import { opsUsers } from '@/src/lib/db/schema'
import { getAdminSession } from '@/src/lib/auth/session'
import { verifyPassword } from '@/src/lib/auth/password'
import { apiSuccess, apiError } from '@/src/lib/api/response'
import { ApiErrorCode } from '@/src/type/api'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return apiError(ApiErrorCode.BAD_REQUEST, '이메일과 비밀번호를 입력해주세요.', 400)
    }

    const [user] = await db
      .select()
      .from(opsUsers)
      .where(eq(opsUsers.email, email))
      .limit(1)

    if (!user || !user.isActive) {
      return apiError(ApiErrorCode.UNAUTHORIZED, '이메일 또는 비밀번호가 올바르지 않습니다.', 401)
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return apiError(ApiErrorCode.UNAUTHORIZED, '이메일 또는 비밀번호가 올바르지 않습니다.', 401)
    }

    const session = await getAdminSession()
    session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
    await session.save()

    return apiSuccess({ name: user.name, role: user.role })
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500, e instanceof Error ? e.message : String(e))
  }
}
