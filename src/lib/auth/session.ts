import { getIronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export type AdminSessionUser = {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'EDITOR' | 'AUDITOR'
}

export type AdminSessionData = {
  user?: AdminSessionUser
}

export const sessionOptions: SessionOptions = {
  password: process.env.ADMIN_SESSION_SECRET!,
  cookieName: 'admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}

export async function getAdminSession() {
  return getIronSession<AdminSessionData>(await cookies(), sessionOptions)
}
