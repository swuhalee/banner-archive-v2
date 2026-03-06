import type { AnalyzedBanner, AnalyzeBannerResult } from '@/src/type/banner';
import type { ApiResponse } from '@/src/type/api';
import { UploadFormValues } from '../_components/upload-form';
import { useMutation } from '@tanstack/react-query';

type AnalyzeBannerParams = {
  form: UploadFormValues;
  reuseImageKey?: string | null;
  onImageKeyReady?: (imageKey: string) => void;
};

async function analyzeBanner(params: AnalyzeBannerParams): Promise<AnalyzeBannerResult> {
  if (!params.form.imageFile) throw new Error('이미지가 없습니다');

  let imageKey = params.reuseImageKey ?? null;

  if (!imageKey) {
    const formData = new FormData();
    formData.append('image', params.form.imageFile);

    imageKey = await fetch('/api/image', {
      method: 'POST',
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new Error('이미지 업로드에 실패했습니다.');
      return res.json();
    }).then((json: ApiResponse<string>) => {
      if (!json.success) throw new Error(json.error.message);
      return json.data;
    });
  }

  if (!imageKey) {
    throw new Error('이미지 키를 생성하지 못했습니다.');
  }
  params.onImageKeyReady?.(imageKey);

  const res = await fetch('/api/banners/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageKey,
      regionText: params.form.regionText,
    }),
  });

  if (!res.headers.get('content-type')?.includes('application/json')) {
    throw new Error('서버와 통신할 수 없습니다.');
  }

  const json: ApiResponse<AnalyzedBanner[]> = await res.json();
  if (!json.success) throw new Error(json.error.message);

  return {
    imageKey,
    candidates: json.data.map((banner) => ({
      id: banner.id,
      imageUrl: banner.imageUrl,
      title: banner.title ?? '',
      hashtagsText: banner.hashtags.join(', '),
      subjectType: banner.subjectType ?? params.form.subjectType,
      regionText: banner.regionText ?? params.form.regionText,
      observedAt: params.form.observedAt,
      excluded: false,
    })),
  };
}

export function useAnalyzeBanner() {
  return useMutation({
    mutationFn: analyzeBanner,
  });
}
