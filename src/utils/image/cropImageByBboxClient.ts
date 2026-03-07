import type { DetectedBanner, CroppedBannerClient } from '@/src/type/analysis';

/**
 * 브라우저 Canvas에서 각 현수막 bbox 영역을 크롭함
 * @param maskedCanvas applyBlurMaskClient가 반환한 블러 처리된 캔버스
 * @param banners Gemini가 반환한 DetectedBanner 배열 (정규화 좌표)
 */
export async function cropImageByBboxClient(
  maskedCanvas: HTMLCanvasElement,
  banners: DetectedBanner[],
): Promise<CroppedBannerClient[]> {
  const imgW = maskedCanvas.width;
  const imgH = maskedCanvas.height;

  const results = await Promise.all(
    banners.map(async ({ tempId, bbox: { x, y, width, height } }) => {
      const left = Math.max(0, Math.round(x * imgW));
      const top = Math.max(0, Math.round(y * imgH));
      const w = Math.min(imgW - left, Math.max(0, Math.round(width * imgW)));
      const h = Math.min(imgH - top, Math.max(0, Math.round(height * imgH)));
      if (w <= 0 || h <= 0) return null;

      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = w;
      cropCanvas.height = h;
      cropCanvas.getContext('2d')!.drawImage(maskedCanvas, left, top, w, h, 0, 0, w, h);

      const blob = await new Promise<Blob>((resolve, reject) => {
        cropCanvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('캔버스 Blob 변환 실패'))),
          'image/jpeg',
          0.9,
        );
      });

      return { tempId, blob, objectUrl: URL.createObjectURL(blob) };
    }),
  );

  return results.filter((r): r is CroppedBannerClient => r !== null);
}
