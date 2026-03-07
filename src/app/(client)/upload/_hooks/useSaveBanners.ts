'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SubjectType, CreateBannerRequest, CandidateBanner } from '@/src/type/banner';
import { ApiSuccessCode } from '@/src/type/api';
import type { ApiResponse } from '@/src/type/api';
import type { UploadUrlInfo } from '@/src/app/api/banners/upload-url/route';

async function getSignedUploadUrls(count: number): Promise<UploadUrlInfo[]> {
  const res = await fetch('/api/banners/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count }),
  });
  const json: ApiResponse<UploadUrlInfo[]> = await res.json();
  if (!json.success) throw new Error(json.error.message);
  return json.data;
}

async function saveBanners(candidates: CandidateBanner[]): Promise<{ hasDuplicate: boolean }> {
  const active = candidates.filter((c) => !c.excluded);
  if (active.length === 0) throw new Error('저장할 항목이 없습니다.');

  // 1. 서명된 업로드 URL 발급
  const urlInfos = await getSignedUploadUrls(active.length);

  // 2. 클라이언트에서 Supabase Storage로 직접 업로드
  await Promise.all(
    active.map((candidate, i) =>
      fetch(urlInfos[i].signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body: candidate.imageBlob,
      }).then((r) => {
        if (!r.ok) throw new Error(`이미지 업로드 실패 (${r.status})`);
      }),
    ),
  );

  // 3. 메타데이터만 서버로 전달
  const body: CreateBannerRequest[] = active.map((candidate, i) => ({
    imageUrl: urlInfos[i].publicUrl,
    imagePath: urlInfos[i].path,
    title: candidate.title || null,
    hashtags: candidate.hashtagsText.split(',').map((h) => h.trim()).filter(Boolean),
    subjectType: (candidate.subjectType as SubjectType) || null,
    regionText: candidate.regionText,
    observedAt: candidate.observedAt,
  }));

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
