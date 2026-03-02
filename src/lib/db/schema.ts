import { AnyPgColumn } from 'drizzle-orm/pg-core'
import { boolean, index, integer, pgEnum, pgTable, real, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

export const opsRoleEnum = pgEnum('ops_role', ['ADMIN', 'EDITOR', 'AUDITOR'])

export const bannerStatusEnum = pgEnum('banner_status', [
    'active',
    'hidden',
    'deleted',
])

export const reportReasonTypeEnum = pgEnum('appeal_reason_type', [
    'privacy',
    'portrait',
    'false_info',
    'other',
])

export const reportStatusEnum = pgEnum('appeal_status', [
    'received',
    'under_review',
    'actioned',
    'rejected',
])

export const subjectTypeEnum = pgEnum('subject_type', [
    'politician',
    'party',
    'other',
])

export const regionKindEnum = pgEnum('region_kind', [
    'sido', 'si', 'gun', 'gu', 'eup', 'myeon', 'dong', 'ri',
])

export const regions = pgTable('regions', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: text('name').notNull(),
    kind: regionKindEnum('kind').notNull(),
    parentId: integer('parent_id').references((): AnyPgColumn => regions.id),
    lat: real('lat'),
    lng: real('lng'),
    sido: text('sido').notNull(),
    sigungu: text('sigungu'),
    eupmyeondong: text('eupmyeondong'),
    fullPath: text('full_path').notNull(),
}, (table) => [
    index('regions_parent_id_idx').on(table.parentId),
    index('regions_sido_idx').on(table.sido),
    index('regions_sigungu_idx').on(table.sigungu),
])

export const opsUsers = pgTable('ops_users', {
    id: uuid('id').primaryKey().notNull(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: opsRoleEnum('role').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const banners = pgTable('banners', {
    id: uuid('id').primaryKey().notNull().default(sql`gen_random_uuid()`),
    title: text('title'),
    hashtags: text('hashtags').array().notNull().default(sql`ARRAY[]::text[]`),
    subjectType: subjectTypeEnum('subject_type'),
    regionText: text('region_text').notNull(),
    regionId: integer('region_id').references(() => regions.id),
    firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull(),
    observedCount: integer('observed_count').notNull().default(1),
    status: bannerStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    index('banners_region_text_idx').on(table.regionText),
    index('banners_subject_type_idx').on(table.subjectType),
    index('banners_status_idx').on(table.status),
])

export const images = pgTable('images', {
    id: uuid('id').primaryKey().notNull().default(sql`gen_random_uuid()`),
    bannerId: uuid('banner_id')
        .notNull()
        .references(() => banners.id, { onDelete: 'cascade' }),
    imageUrl: text('image_url').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const reports = pgTable('reports', {
    id: uuid('id').primaryKey().notNull().default(sql`gen_random_uuid()`),
    bannerId: uuid('banner_id')
        .notNull()
        .references(() => banners.id, { onDelete: 'cascade' }),
    reasonType: reportReasonTypeEnum('reason_type').notNull(),
    reasonDetail: text('reason_detail'),
    status: reportStatusEnum('status').notNull().default('received'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const regionsRelations = relations(regions, ({ one, many }) => ({
    parent: one(regions, { fields: [regions.parentId], references: [regions.id], relationName: 'parent' }),
    children: many(regions, { relationName: 'parent' }),
    banners: many(banners),
}))

export const bannersRelations = relations(banners, ({ one, many }) => ({
    images: many(images),
    region: one(regions, { fields: [banners.regionId], references: [regions.id] }),
}))

export const imagesRelations = relations(images, ({ one }) => ({
    banner: one(banners, {
        fields: [images.bannerId],
        references: [banners.id],
    }),
}))
