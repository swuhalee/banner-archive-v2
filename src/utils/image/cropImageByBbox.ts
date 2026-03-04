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

  const cropped = await Promise.all(
    banners.map(async ({ tempId, bbox: { x, y, width, height } }) => {
      const left = Math.min(imgW, Math.max(0, Math.round(x * imgW)));
      const top = Math.min(imgH, Math.max(0, Math.round(y * imgH)));
      const right = Math.min(imgW, Math.max(0, Math.round((x + width) * imgW)));
      const bottom = Math.min(imgH, Math.max(0, Math.round((y + height) * imgH)));

      const regionW = right - left;
      const regionH = bottom - top;
      if (regionW <= 0 || regionH <= 0) return null;

      const buffer = await sharp(imageBuffer)
        .extract({ left, top, width: regionW, height: regionH })
        .jpeg({ quality: 85 })
        .toBuffer();

      return { tempId, buffer };
    })
  );

  return cropped.filter((item): item is CroppedBanner => item !== null);
}
