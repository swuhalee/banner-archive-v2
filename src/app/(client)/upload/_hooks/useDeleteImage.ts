'use client';

import { useMutation } from '@tanstack/react-query';
import type { ApiResponse } from '@/src/type/api';

type DeleteImageParams = {
  imageKeys: string[];
};

async function requestDeleteImage(params: DeleteImageParams): Promise<ApiResponse<unknown>> {
  const response = await fetch('/api/image', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok && !response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('이미지 정리에 실패했습니다.');
  }

  return response.json();
}

async function deleteImage(params: DeleteImageParams): Promise<void> {
  if (params.imageKeys.length === 0) return;

  const json = await requestDeleteImage(params);
  if (!json.success) throw new Error(json.error.message);
}

export function useDeleteImage() {
  return useMutation({
    mutationFn: deleteImage,
  });
}
