import { randomUUID } from 'crypto'
import { NextRequest } from 'next/server'
import { getBanners, createBanner } from '@/src/lib/api/banner'
import { uploadBannerImage, deleteBannerImage } from '@/src/lib/storage/banner'
import { apiSuccess, apiError } from '@/src/lib/api/response'
import { ApiSuccessCode, ApiErrorCode } from '@/src/type/api'
import type { BannerListParams, BannerSortOption, BannerStatus, SubjectType } from '@/src/type/banner'
import { CreateBannerRequestSchema } from '@/src/lib/validation/banner'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const params: BannerListParams = {
      page: searchParams.has('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.has('limit') ? Number(searchParams.get('limit')) : 20,
      status: (searchParams.get('status') as BannerStatus) ?? undefined,
      subjectType: (searchParams.get('subjectType') as SubjectType) ?? undefined,
      regionText: searchParams.get('regionText') ?? undefined,
      sort: (searchParams.get('sort') as BannerSortOption) ?? undefined,
    }

    const data = await getBanners(params)
    return apiSuccess(data)
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = CreateBannerRequestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return apiError(ApiErrorCode.BAD_REQUEST, '잘못된 요청입니다.');
    }

    // 이미지 업로드는 DB를 사용하지 않으므로 병렬 처리
    const uploaded = await Promise.all(
      parsed.data.map(async (item) => {
        const newId = randomUUID();
        const imageUrl = await uploadBannerImage(item.imageBase64, newId);
        return { item, newId, imageUrl };
      })
    );

    // SERIALIZABLE 트랜잭션 간 read-write 충돌을 방지하기 위해 순차 처리
    const results = [];
    for (const { item, newId, imageUrl } of uploaded) {
      const observedAt = new Date(item.observedAt);
      try {
        const { banner, isDuplicate } = await createBanner(
          {
            id: newId,
            title: item.title,
            hashtags: item.hashtags,
            subjectType: item.subjectType,
            regionText: item.regionText,
            firstSeenAt: observedAt,
            lastSeenAt: observedAt,
          },
          imageUrl,
        );

        // 중복 판정 시 미리 업로드한 이미지를 스토리지에서 제거
        if (isDuplicate) {
          await deleteBannerImage(newId).catch(() => {});
        }

        results.push({ ...banner, isDuplicate });
      } catch (e) {
        // 트랜잭션 실패 시 업로드한 이미지 롤백
        await deleteBannerImage(newId).catch(() => {});
        throw e;
      }
    }

    const hasDuplicate = results.some((r) => r.isDuplicate);
    return apiSuccess(results, hasDuplicate ? ApiSuccessCode.DUPLICATE : ApiSuccessCode.CREATED, 201);
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500);
  }
}
