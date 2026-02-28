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

    const contentType = res.headers.get('content-type') ?? '';
    if (!res.ok) {
        if (res.status === 429) {
            const retryAfter = Number(res.headers.get('Retry-After') ?? '0');
            const waitSeconds = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : null;
            throw new Error(
                waitSeconds
                    ? `요청이 너무 많습니다. ${waitSeconds}초 후 다시 시도해주세요.`
                    : '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
            );
        }

        if (contentType.includes('application/json')) {
            const json = await res.json() as
                | ApiResponse<AnalyzedBanner[]>
                | { error?: string; message?: string };

            if ('success' in json && !json.success) {
                throw new Error(json.error.message);
            }
            if ('error' in json && typeof json.error === 'string') {
                throw new Error(json.error);
            }
            if ('message' in json && typeof json.message === 'string') {
                throw new Error(json.message);
            }
        }

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
