import sharp from "sharp";
import type { DetectedBanner } from "@/src/type/analysis";

export type CroppedBanner = { tempId: string; buffer: Buffer };

export async function cropImageByBbox(
    imageBuffer: Buffer,
    banners: DetectedBanner[]
): Promise<CroppedBanner[]> {
    if (banners.length === 0) return [];

    const { width: imgW, height: imgH } = await sharp(imageBuffer).metadata();
    if (!imgW || !imgH) throw new Error("이미지를 읽어 올 수 없습니다.");

    return Promise.all(
        banners.map(async ({ tempId, bbox: { x, y, width, height } }) => {
            const left = Math.max(0, Math.round(x * imgW));
            const top = Math.max(0, Math.round(y * imgH));
            const right = Math.min(imgW, Math.round((x + width) * imgW));
            const bottom = Math.min(imgH, Math.round((y + height) * imgH));

            const buffer = await sharp(imageBuffer)
                .extract({ left, top, width: right - left, height: bottom - top })
                .jpeg({ quality: 85 })
                .toBuffer();

            return { tempId, buffer };
        })
    );
}
