import { GoogleGenerativeAI } from "@google/generative-ai";
import { SUBJECT_TYPE_MAP } from "@/src/type/banner";
import type { DetectedBanner, AnalysisResult, BlurRegion } from "@/src/type/analysis";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: { responseMimeType: "application/json" },
});

const PROMPT = `이 사진에서 보이는 모든 현수막을 감지하고, 개인정보 보호 대상(얼굴·번호판)도 감지하여 아래 JSON 형식으로만 응답하세요.

{
  "banners": [
    {
      "tempId": "banner_0",
      "title": "현수막의 핵심 슬로건 또는 주요 문구 (없거나 판독 불가면 null)",
      "hashtags": ["키워드1", "키워드2"],
      "subjectType": "정치인 또는 정당 또는 기타 또는 null",
      "bbox": { "x": 0.10, "y": 0.05, "width": 0.80, "height": 0.60 },
      "confidence": 0.95
    }
  ],
  "privacyRegions": [
    {
      "type": "face",
      "bbox": { "x": 0.10, "y": 0.05, "width": 0.08, "height": 0.12 }
    },
    {
      "type": "licensePlate",
      "bbox": { "x": 0.45, "y": 0.70, "width": 0.15, "height": 0.05 }
    }
  ]
}

규칙:
- 멀리 작게 보이는 현수막도 놓치지 말고 감지
- bbox는 이미지 전체 크기 대비 비율(0.0~1.0)로 표현. x·y는 좌상단, width·height는 크기
- tempId는 "banner_0", "banner_1" 순으로 부여
- title: 현수막에서 가장 중심이 되는 한 문장 또는 슬로건
- hashtags: 주제, 주체, 요구사항, 장소를 나타내는 한국어 키워드 최대 12개, # 기호 없이
- subjectType: "정치인", "정당", "기타", null 중 하나
- confidence: 현수막 감지 신뢰도 (0.0~1.0)
- privacyRegions.type: "face" (사람 얼굴) 또는 "licensePlate" (한국 차량 번호판)
- 현수막이 없으면: { "banners": [], "privacyRegions": [] }`;


export async function analyzeImage(
    imageBuffer: Buffer,
    mimeType: string = "image/jpeg"
): Promise<AnalysisResult> {
    const result = await model.generateContent([
        {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType,
            },
        },
        PROMPT,
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = JSON.parse(result.response.text());

    const banners: DetectedBanner[] = (raw.banners ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (b: any): DetectedBanner => ({
            tempId: b.tempId,
            title: b.title ?? null,
            hashtags: b.hashtags ?? [],
            subjectType: b.subjectType ? (SUBJECT_TYPE_MAP[b.subjectType] ?? null) : null,
            bbox: b.bbox,
            confidence: b.confidence,
        })
    );

    const privacyRegions: BlurRegion[] = (raw.privacyRegions ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r: any): BlurRegion => ({
            type: r.type,
            bbox: r.bbox,
        })
    );

    return { banners, privacyRegions };
}
