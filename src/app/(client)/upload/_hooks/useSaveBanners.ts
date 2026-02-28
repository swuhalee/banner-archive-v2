'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SubjectType, CreateBannerRequest, CandidateBanner } from '@/src/type/banner';
import { ApiSuccessCode } from '@/src/type/api';
import type { ApiResponse } from '@/src/type/api';

function toSaveItem(candidate: CandidateBanner): CreateBannerRequest {
    return {
        imageBase64: candidate.imageUrl,
        title: candidate.title || null,
        hashtags: candidate.hashtagsText
            .split(',')
            .map((h) => h.trim())
            .filter(Boolean),
        subjectType: (candidate.subjectType as SubjectType) || null,
        regionText: candidate.regionText,
        observedAt: candidate.observedAt,
    };
}

async function saveBanners(candidates: CandidateBanner[]): Promise<{ hasDuplicate: boolean }> {
    const body: CreateBannerRequest[] = candidates
        .filter((c) => !c.excluded)
        .map(toSaveItem);

    if (body.length === 0) throw new Error('저장할 항목이 없습니다.');

    const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok && !res.headers.get('content-type')?.includes('application/json')) {
        throw new Error('서버와 통신할 수 없습니다.');
    }
    const json: ApiResponse<unknown> = await res.json();
    if (!json.success) throw new Error(json.error.message);

    return { hasDuplicate: json.code === ApiSuccessCode.DUPLICATE };
}

export function useSaveBanners() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saveBanners,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
        },
    });
}
