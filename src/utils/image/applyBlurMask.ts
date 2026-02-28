import sharp from "sharp";
import type { BlurRegion } from "@/src/type/analysis";

const BLUR_SIGMA = 20;

export async function applyBlurMask(
    imageBuffer: Buffer,
    privacyRegions: BlurRegion[]
): Promise<Buffer> {
    if (privacyRegions.length === 0) return imageBuffer;

    const image = sharp(imageBuffer);
    const { width: imgW, height: imgH } = await image.metadata();
    if (!imgW || !imgH) throw new Error("이미지를 읽어 올 수 없습니다.");

    let current = imageBuffer;

    for (const region of privacyRegions) {
        const { x, y, width, height } = region.bbox;

        const left = Math.max(0, Math.round(x * imgW));
        const top = Math.max(0, Math.round(y * imgH));
        const right = Math.min(imgW, Math.round((x + width) * imgW));
        const bottom = Math.min(imgH, Math.round((y + height) * imgH));

        const regionW = right - left;
        const regionH = bottom - top;
        if (regionW <= 0 || regionH <= 0) continue;

        const blurred = await sharp(current)
            .extract({ left, top, width: regionW, height: regionH })
            .blur(BLUR_SIGMA)
            .toBuffer();

        current = await sharp(current)
            .composite([{ input: blurred, left, top }])
            .jpeg()
            .toBuffer();
    }

    return current;
}
