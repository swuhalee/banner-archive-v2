import { NextRequest } from "next/server";
import { analyzeImage } from "@/src/lib/ai/imageAnalysis";
import { applyBlurMask } from "@/src/utils/image/applyBlurMask";
import { cropImageByBbox } from "@/src/utils/image/cropImageByBbox";
import { apiSuccess, apiError } from "@/src/lib/api/response";
import { ApiErrorCode } from "@/src/type/api";
import type { AnalyzedBanner } from "@/src/type/banner";

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

        // Gemini 이미지 분석
        const analysis = await analyzeImage(imageBuffer, file.type);

        // 개인정보 영역 블러 처리
        const maskedBuffer = await applyBlurMask(imageBuffer, analysis.privacyRegions);

        // 현수막 bbox별 크롭
        const cropped = await cropImageByBbox(maskedBuffer, analysis.banners);
        const croppedMap = new Map(cropped.map(({ tempId, buffer }) => [tempId, buffer]));

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
        const message = e instanceof Error ? e.message : '서버 오류가 발생했습니다.';
        return apiError(ApiErrorCode.INTERNAL_ERROR, message, 500);
    }
}
