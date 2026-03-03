import { NextRequest } from "next/server";
import sharp from "sharp";
import { analyzeImage } from "@/src/lib/ai/imageAnalysis";
import { applyBlurMask } from "@/src/utils/image/applyBlurMask";
import { cropImageByBbox } from "@/src/utils/image/cropImageByBbox";
import { apiSuccess, apiError } from "@/src/lib/api/response";
import { ApiErrorCode } from "@/src/type/api";
import type { AnalyzedBanner } from "@/src/type/banner";

const GEMINI_MAX_LONG_EDGE = 1500;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    const rawRegionText = formData.get("regionText");

    if (!(file instanceof File)) {
      return apiError(ApiErrorCode.BAD_REQUEST, "업로드된 사진이 없습니다.");
    }

    if (rawRegionText !== null && typeof rawRegionText !== "string") {
      return apiError(ApiErrorCode.BAD_REQUEST, "지역 정보가 올바르지 않습니다.");
    }

    const regionText = rawRegionText;

    const imageBuffer = Buffer.from(await file.arrayBuffer());
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
    const croppedMap = new Map(cropped.map(({ tempId, buffer }) => [tempId, buffer]));

    // Base64 인코딩 + 응답 조립
    const result: AnalyzedBanner[] = [];
    for (const banner of analysis.banners) {
      const buf = croppedMap.get(banner.tempId);
      if (!buf) continue;
      result.push({
        id: banner.tempId,
        title: banner.title,
        hashtags: banner.hashtags,
        subjectType: banner.subjectType,
        regionText,
        image: `data:image/jpeg;base64,${buf.toString('base64')}`,
      });
    }
  
    return apiSuccess(result);
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500);
  }
}
