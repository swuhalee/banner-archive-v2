import db from '../db/db'
import { reports } from '../db/schema'
import type { CreateReportRequest } from '../../type/report'

export async function createReport(input: CreateReportRequest) {
    const [report] = await db
        .insert(reports)
        .values({
            bannerId: input.bannerId,
            reasonType: input.reasonType,
            reasonDetail: input.reasonDetail ?? null,
        })
        .returning()
    return report
}
