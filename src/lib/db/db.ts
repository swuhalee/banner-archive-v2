import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// prepare: false  → Transaction pool mode에서 필요
// max: 1          → Serverless 환경에서 인스턴스당 연결 수 제한 (connection leak 방지)
const client = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 })
const db = drizzle({ client });

export default db