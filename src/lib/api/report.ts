import { and, desc, eq, getTableColumns, notInArray, sql } from 'drizzle-orm'
import db from '../db/db'
import { banners, images, reports } from '../db/schema'
import type { CreateReportRequest } from '../../type/report'
import type { ReportStatus, BannerStatus } from '../../type/admin'

const firstImage = db
  .selectDistinctOn([images.bannerId], {
    bannerId: images.bannerId,
    imageUrl: images.imageUrl,
  })
  .from(images)
  .orderBy(images.bannerId, images.createdAt)
  .as('first_image')

export async function createReport(input: CreateReportRequest) {
  const [banner] = await db
    .select({ status: banners.status })
    .from(banners)
    .where(eq(banners.id, input.bannerId))
    .limit(1)

  if (!banner || banner.status !== 'active') return null

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

export async function getAdminReports({
  status,
  page = 1,
  limit = 20,
}: {
  status?: ReportStatus
  page?: number
  limit?: number
}) {
  const conditions = status ? [eq(reports.status, status)] : []

  const [rows, countResult] = await Promise.all([
    db
      .select({
        ...getTableColumns(reports),
        banner: {
          id: banners.id,
          title: banners.title,
          regionText: banners.regionText,
          status: banners.status,
        },
        imageUrl: firstImage.imageUrl,
      })
      .from(reports)
      .leftJoin(banners, eq(reports.bannerId, banners.id))
      .leftJoin(firstImage, eq(firstImage.bannerId, banners.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(reports)
      .where(conditions.length ? and(...conditions) : undefined),
  ])

  return { reports: rows, total: countResult[0]?.count ?? 0 }
}

export async function getAdminReportById(id: string) {
  const [row] = await db
    .select({
      ...getTableColumns(reports),
      banner: {
        id: banners.id,
        title: banners.title,
        regionText: banners.regionText,
        status: banners.status,
      },
      imageUrl: firstImage.imageUrl,
    })
    .from(reports)
    .leftJoin(banners, eq(reports.bannerId, banners.id))
    .leftJoin(firstImage, eq(firstImage.bannerId, banners.id))
    .where(eq(reports.id, id))

  return row ?? null
}

export async function updateReportStatus(id: string, status: ReportStatus) {
  const [updated] = await db
    .update(reports)
    .set({ status, updatedAt: new Date() })
    .where(eq(reports.id, id))
    .returning()
  return updated
}

export async function bulkActionReportsByBannerId(bannerId: string) {
  await db
    .update(reports)
    .set({ status: 'actioned', updatedAt: new Date() })
    .where(
      and(
        eq(reports.bannerId, bannerId),
        notInArray(reports.status, ['actioned', 'rejected']),
      )
    )
}

export async function updateBannerStatus(bannerId: string, status: BannerStatus) {
  const [updated] = await db
    .update(banners)
    .set({ status, updatedAt: new Date() })
    .where(eq(banners.id, bannerId))
    .returning()
  return updated
}

export async function getAdminReportsByBanner({
  status,
  page = 1,
  limit = 20,
}: {
  status?: ReportStatus
  page?: number
  limit?: number
}) {
  const havingClause = status
    ? sql`count(${reports.id}) filter (where ${reports.status} = ${status}) > 0`
    : undefined

  const [rows, countResult] = await Promise.all([
    db
      .select({
        bannerId: banners.id,
        bannerTitle: banners.title,
        bannerRegionText: banners.regionText,
        bannerStatus: banners.status,
        imageUrl: firstImage.imageUrl,
        reportCount: sql<number>`count(${reports.id})::int`,
        latestAt: sql<string>`max(${reports.createdAt})`,
        receivedCount: sql<number>`count(${reports.id}) filter (where ${reports.status} = 'received')::int`,
        underReviewCount: sql<number>`count(${reports.id}) filter (where ${reports.status} = 'on_hold')::int`,
        actionedCount: sql<number>`count(${reports.id}) filter (where ${reports.status} = 'actioned')::int`,
        rejectedCount: sql<number>`count(${reports.id}) filter (where ${reports.status} = 'rejected')::int`,
      })
      .from(banners)
      .innerJoin(reports, eq(reports.bannerId, banners.id))
      .leftJoin(firstImage, eq(firstImage.bannerId, banners.id))
      .groupBy(banners.id, firstImage.imageUrl)
      .having(havingClause)
      .orderBy(sql`max(${reports.createdAt}) desc`)
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ count: sql<number>`count(distinct ${reports.bannerId})::int` })
      .from(reports)
      .where(status ? eq(reports.status, status) : undefined),
  ])

  return { groups: rows, total: countResult[0]?.count ?? 0 }
}

export async function getAdminReportsByBannerId(bannerId: string) {
  const [banner] = await db
    .select({
      id: banners.id,
      title: banners.title,
      regionText: banners.regionText,
      status: banners.status,
      imageUrl: firstImage.imageUrl,
    })
    .from(banners)
    .leftJoin(firstImage, eq(firstImage.bannerId, banners.id))
    .where(eq(banners.id, bannerId))

  const rows = await db
    .select()
    .from(reports)
    .where(eq(reports.bannerId, bannerId))
    .orderBy(desc(reports.createdAt))

  return { banner: banner ?? null, reports: rows }
}
