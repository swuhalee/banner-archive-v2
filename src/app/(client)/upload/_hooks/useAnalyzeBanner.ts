import type { AnalyzeResult } from '@/src/type/analysis';
import type { ApiResponse } from '@/src/type/api';
import { FormValues } from '../_components/upload-form';
import { resizeForAnalysis } from '@/src/utils/image/imageConverter';
import { useMutation } from '@tanstack/react-query';


async function analyzeBanner(params: FormValues): Promise<AnalyzeResult> {
  if (!params.imageFile) throw new Error('이미지가 없습니다');

  // 분석용으로 1024px 이하로 리사이즈 — 원본 File은 유지
  const imageBase64 = await resizeForAnalysis(params.imageFile);

  const res = await fetch('/api/banners/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, regionText: params.regionText }),
  });

  if (!res.headers.get('content-type')?.includes('application/json')) {
    throw new Error('서버와 통신할 수 없습니다.');
  }

  const json: ApiResponse<AnalyzeResult> = await res.json();
  if (!json.success) throw new Error(json.error.message);

  return json.data;
}

export function useAnalyzeBanner() {
  return useMutation({
    mutationFn: analyzeBanner,
  });
}
