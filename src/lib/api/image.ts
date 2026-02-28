import { eq } from 'drizzle-orm';
import db from '../db/db';
import { images } from '../db/schema';
import type { CreateImageInput } from '../../type/image';

export async function createImage(input: CreateImageInput) {
    const [image] = await db.insert(images).values(input).returning();
    return image;
}

export async function getImageByBannerId(bannerId: string) {
    const [image] = await db.select().from(images).where(eq(images.bannerId, bannerId));
    return image ?? null;
}
