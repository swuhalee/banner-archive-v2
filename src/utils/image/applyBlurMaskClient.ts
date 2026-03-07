import { canvasRGBA } from 'stackblur-canvas';
import type { BlurRegion } from '@/src/type/analysis';

/**
 * 브라우저 Canvas에서 개인정보 영역(얼굴·번호판)에 블러를 적용함
 * stackblur-canvas를 사용해 구형 iOS Safari 포함 모든 환경에서 동작함
 * @returns 블러가 적용된 HTMLCanvasElement (원본 크기)
 */
export async function applyBlurMaskClient(
  imageFile: File,
  privacyRegions: BlurRegion[],
): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(imageFile);
  const { width: imgW, height: imgH } = bitmap;

  const canvas = document.createElement('canvas');
  canvas.width = imgW;
  canvas.height = imgH;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  for (const region of privacyRegions) {
    const { x, y, width, height } = region.bbox;
    const left = Math.max(0, Math.round(x * imgW));
    const top = Math.max(0, Math.round(y * imgH));
    const w = Math.min(imgW - left, Math.max(0, Math.round(width * imgW)));
    const h = Math.min(imgH - top, Math.max(0, Math.round(height * imgH)));
    if (w <= 0 || h <= 0) continue;

    canvasRGBA(canvas, left, top, w, h, 20);
  }

  return canvas;
}
