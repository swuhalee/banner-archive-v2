/**
 * 어드민 계정 생성 스크립트
 * 사용법: npx tsx --env-file=.env.development.local scripts/create-admin.ts
 */
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { opsUsers } from '../src/lib/db/schema'

const EMAIL = 'admin@example.com'
const PASSWORD = 'changeme1234!'
const NAME = '관리자'
const ROLE = 'ADMIN' as const

async function main() {
  const client = postgres(process.env.DATABASE_URL!, { prepare: false })
  const db = drizzle({ client })

  const passwordHash = await bcrypt.hash(PASSWORD, 12)

  await db.insert(opsUsers).values({
    id: randomUUID(),
    email: EMAIL,
    name: NAME,
    passwordHash,
    role: ROLE,
    isActive: true,
  })

  console.log(`어드민 계정 생성 완료`)
  console.log(`   이메일: ${EMAIL}`)
  console.log(`   비밀번호: ${PASSWORD}`)
  console.log(`   역할: ${ROLE}`)

  await client.end()
}

main().catch((e) => {
  process.exit(1)
})
