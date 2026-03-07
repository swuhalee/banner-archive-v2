import { NextRequest } from "next/server";
import { analyzeImage } from "@/src/lib/ai/imageAnalysis";
import { apiSuccess, apiError } from "@/src/lib/api/response";
import { ApiErrorCode } from "@/src/type/api";
import type { AnalysisResult } from "@/src/type/analysis";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, regionText } = body;

    if (typeof imageBase64 !== "string" || !imageBase64) {
      return apiError(ApiErrorCode.BAD_REQUEST, "업로드된 사진이 없습니다.", 400, '"imageBase64" must be a non-empty string');
    }

    if (regionText !== undefined && regionText !== null && typeof regionText !== "string") {
      return apiError(ApiErrorCode.BAD_REQUEST, "지역 정보가 올바르지 않습니다.", 400, '"regionText" must be a string if provided');
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Gemini 분석 — 좌표(JSON)만 반환
    const analysis: AnalysisResult = await analyzeImage(imageBuffer, "image/jpeg");

    return apiSuccess({ ...analysis, regionText: regionText ?? null });
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, "서버 오류가 발생했습니다.", 500, e instanceof Error ? e.message : String(e));
  }
}
