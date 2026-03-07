import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { getSignedUploadUrl } from '@/src/lib/storage/banner';
import { apiSuccess, apiError } from '@/src/lib/api/response';
import { ApiErrorCode } from '@/src/type/api';

export type UploadUrlInfo = {
  path: string;
  signedUrl: string;
  publicUrl: string;
};

export async function POST(request: NextRequest) {
  try {
    const { count } = await request.json();
    const n = Math.min(Math.max(Number(count) || 1, 1), 20);

    const urlInfos: UploadUrlInfo[] = await Promise.all(
      Array.from({ length: n }, async () => {
        const path = `${randomUUID()}.jpg`;
        const { signedUrl, publicUrl } = await getSignedUploadUrl(path);
        return { path, signedUrl, publicUrl };
      }),
    );

    return apiSuccess(urlInfos);
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500, e instanceof Error ? e.message : String(e));
  }
}
