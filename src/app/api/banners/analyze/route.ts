import { NextRequest } from "next/server";
import sharp from "sharp";
import { analyzeImage } from "@/src/lib/ai/imageAnalysis";
import { applyBlurMask } from "@/src/utils/image/applyBlurMask";
import { cropImageByBbox } from "@/src/utils/image/cropImageByBbox";
import { apiSuccess, apiError } from "@/src/lib/api/response";
import { ApiErrorCode } from "@/src/type/api";
import type { AnalyzedBanner } from "@/src/type/banner";
import { deleteImageByKey, downloadImageByKey, uploadCropImage } from "@/src/lib/storage/banner";

const GEMINI_MAX_LONG_EDGE = 1500;
const TEMP_KEY_RE = /^temp\/[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]+$/;

function isValidTempImageKey(value: string): boolean {
  return TEMP_KEY_RE.test(value) && !value.includes("..");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageKey, regionText } = body;

    if (typeof imageKey !== "string" || !isValidTempImageKey(imageKey)) {
      return apiError(ApiErrorCode.BAD_REQUEST, "업로드된 사진이 없습니다.", 400, 'Expected valid "imageKey" in request body');
    }

    if (!regionText || typeof regionText !== "string") {
      return apiError(ApiErrorCode.BAD_REQUEST, "지역 정보가 올바르지 않습니다.", 400, '"regionText" must be a string if provided');
    }

    const imageBuffer = await downloadImageByKey(imageKey);
    const { width: imgW, height: imgH } = await sharp(imageBuffer).metadata();

    // Gemini용 리사이즈 (장변 1500px 초과 시에만 축소)
    const longEdge = Math.max(imgW ?? 0, imgH ?? 0);
    let geminiBuffer: Buffer;
    if (longEdge > GEMINI_MAX_LONG_EDGE) {
      const { data } = await sharp(imageBuffer)
        .resize({ width: imgW! >= imgH! ? GEMINI_MAX_LONG_EDGE : undefined, height: imgH! > imgW! ? GEMINI_MAX_LONG_EDGE : undefined, withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer({ resolveWithObject: true });
      geminiBuffer = data;
    } else {
      geminiBuffer = imageBuffer;
    }

    // Gemini 이미지 분석 (리사이즈된 이미지 사용)
    const analysis = await analyzeImage(geminiBuffer, 'image/jpeg');

    // 개인정보 영역 블러 처리
    const maskedBuffer = await applyBlurMask(imageBuffer, analysis.privacyRegions);

    // 현수막 bbox별 크롭
    const cropped = await cropImageByBbox(maskedBuffer, analysis.banners);

    // 크롭된 이미지들을 스토리지에 업로드하고 URL 리스트 생성
    const cropImages = await Promise.all(
      cropped.map(async ({ tempId, buffer }) => {
        const imageUrl = await uploadCropImage(buffer, tempId);
        return { tempId, imageUrl };
      })
    );
    const cropImageMap = new Map(cropImages.map(({ tempId, imageUrl }) => [tempId, imageUrl]));

    const result: AnalyzedBanner[] = [];
    for (const banner of analysis.banners) {
      const imageUrl = cropImageMap.get(banner.tempId);
      if (!imageUrl) continue;
      result.push({
        id: banner.tempId,
        title: banner.title,
        hashtags: banner.hashtags,
        subjectType: banner.subjectType,
        regionText,
        imageUrl,
      });
    }

    // 후보가 실제로 생성된 성공 케이스에서만 temp 원본 정리
    if (result.length > 0) {
      await deleteImageByKey(imageKey).catch(() => {});
    }

    return apiSuccess(result);
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500, e instanceof Error ? e.message : String(e));
  }
}
