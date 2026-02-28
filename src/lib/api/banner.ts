import { eq, and, ilike, sql, SQL, getTableColumns, asc, desc } from 'drizzle-orm';
import db from '../db/db';
import { banners, images } from '../db/schema';
import type { CreateBannerInput, BannerListParams } from '../../type/banner';
import { findDuplicateBannerId } from '../../utils/duplicate/jaccard';

export async function getBanners(params: BannerListParams = {}) {
    const { status, subjectType, regionText, sort = 'recent', page = 1, limit = 20 } = params;

    const conditions: SQL[] = [eq(banners.status, status ?? 'active')];
    if (subjectType) conditions.push(eq(banners.subjectType, subjectType));
    if (regionText) conditions.push(ilike(banners.regionText, `%${regionText}%`));

    const offset = (page - 1) * limit;

    // 배너당 가장 먼저 등록된 이미지 1개를 DISTINCT ON으로 추출
    const firstImage = db
        .selectDistinctOn([images.bannerId], {
            bannerId: images.bannerId,
            imageUrl: images.imageUrl,
        })
        .from(images)
        .orderBy(images.bannerId, images.createdAt)
        .as('first_image');

    return db
        .select({
            ...getTableColumns(banners),
            imageUrl: firstImage.imageUrl,
        })
        .from(banners)
        .leftJoin(firstImage, eq(firstImage.bannerId, banners.id))
        .where(and(...conditions))
        .limit(limit)
        .offset(offset)
        .orderBy(
            sort === 'first' ? asc(banners.firstSeenAt)
            : sort === 'count' ? desc(banners.observedCount)
            : desc(banners.lastSeenAt),
            asc(banners.id)
        );
}

export async function getBannerById(id: string) {
    const firstImage = db
        .selectDistinctOn([images.bannerId], {
            bannerId: images.bannerId,
            imageUrl: images.imageUrl,
        })
        .from(images)
        .orderBy(images.bannerId, images.createdAt)
        .as('first_image');

    const [result] = await db
        .select({
            ...getTableColumns(banners),
            imageUrl: firstImage.imageUrl,
        })
        .from(banners)
        .leftJoin(firstImage, eq(firstImage.bannerId, banners.id))
        .where(eq(banners.id, id));

    return result ?? null;
}

export async function createBanner(input: CreateBannerInput, imageUrl?: string) {
    return db.transaction(async (tx) => {
        const regionBanners = await tx
            .select()
            .from(banners)
            .where(eq(banners.regionText, input.regionText));

        const duplicateId = findDuplicateBannerId(input, regionBanners);
        if (duplicateId) {
            const [updated] = await tx
                .update(banners)
                .set({
                    lastSeenAt: input.firstSeenAt,
                    observedCount: sql`${banners.observedCount} + 1`,
                })
                .where(eq(banners.id, duplicateId))
                .returning();
            return { banner: updated, isDuplicate: true };
        }

        const [banner] = await tx.insert(banners).values(input).returning();
        if (imageUrl) {
            await tx.insert(images).values({ bannerId: banner.id, imageUrl });
        }
        return { banner, isDuplicate: false };
    }, { isolationLevel: 'serializable' });
}