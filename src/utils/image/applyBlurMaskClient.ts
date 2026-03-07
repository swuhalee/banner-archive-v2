import type { BlurRegion } from '@/src/type/analysis';

/**
 * 브라우저 Canvas에서 개인정보 영역(얼굴·번호판)에 블러를 적용함
 * 서버로 이미지를 보내지 않고 클라이언트에서 직접 처리함
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

  // blur() CSS 필터는 캔버스 경계에서 엣지가 잘리므로
  // 실제 영역보다 PAD만큼 더 큰 소스를 그린 후 중앙 영역만 복사함
  const PAD = 30;

  for (const region of privacyRegions) {
    const { x, y, width, height } = region.bbox;
    const left = Math.max(0, Math.round(x * imgW));
    const top = Math.max(0, Math.round(y * imgH));
    const w = Math.min(imgW - left, Math.max(0, Math.round(width * imgW)));
    const h = Math.min(imgH - top, Math.max(0, Math.round(height * imgH)));
    if (w <= 0 || h <= 0) continue;

    // 패딩 포함 소스 영역 (이미지 경계 클램핑)
    const srcX = Math.max(0, left - PAD);
    const srcY = Math.max(0, top - PAD);
    const srcW = Math.min(imgW - srcX, w + PAD * 2);
    const srcH = Math.min(imgH - srcY, h + PAD * 2);
    // tmp 캔버스 내에서 실제 블러할 영역의 오프셋
    const offsetX = left - srcX;
    const offsetY = top - srcY;

    const tmp = document.createElement('canvas');
    tmp.width = srcW;
    tmp.height = srcH;
    const tmpCtx = tmp.getContext('2d')!;
    tmpCtx.filter = 'blur(20px)';
    tmpCtx.drawImage(canvas, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

    // 패딩 제외, 실제 영역(w×h)만 원본 캔버스에 복사
    ctx.drawImage(tmp, offsetX, offsetY, w, h, left, top, w, h);
  }

  return canvas;
}
