import type { AnalyzedBanner, CandidateBanner } from '@/src/type/banner';
import type { ApiResponse } from '@/src/type/api';
import { FormValues } from '../_components/upload-form';
import { useMutation } from '@tanstack/react-query';

async function analyzeBanner(params: FormValues): Promise<CandidateBanner[]> {
    if (!params.imageFile) throw new Error('이미지가 없습니다');

    const body = new FormData();
    body.append('image', params.imageFile);
    body.append('regionText', params.regionText);

    const res = await fetch('/api/banners/analyze', {
        method: 'POST',
        body,
    });

    if (!res.headers.get('content-type')?.includes('application/json')) {
        throw new Error('서버와 통신할 수 없습니다.');
    }

    const json: ApiResponse<AnalyzedBanner[]> = await res.json();
    if (!json.success) throw new Error(json.error.message);

    return json.data.map((banner) => ({
        id: banner.id,
        imageUrl: banner.image,
        title: banner.title ?? '',
        hashtagsText: banner.hashtags.join(', '),
        subjectType: banner.subjectType ?? params.subjectType,
        regionText: banner.regionText ?? params.regionText,
        observedAt: params.observedAt,
        excluded: false,
    }));
}

export function useAnalyzeBanner() {
    return useMutation({
        mutationFn: analyzeBanner,
    });
}
