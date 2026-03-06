import { randomUUID } from 'crypto'
import { NextRequest } from 'next/server'
import { getBanners, createBanner } from '@/src/lib/api/banner'
import { apiSuccess, apiError } from '@/src/lib/api/response'
import { ApiSuccessCode, ApiErrorCode } from '@/src/type/api'
import type { BannerListParams, BannerSortOption, BannerStatus, SubjectType } from '@/src/type/banner'
import { SaveBannersRequestSchema } from '@/src/lib/validation/banner'
import { moveImageToBanners, deleteImageByKey, deleteTempImageByKey } from '@/src/lib/storage/banner'
import { getValidatedStorageImageKey, isTemporaryImageKey } from '@/src/lib/validation/storage'

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
    return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500, e instanceof Error ? e.message : String(e));
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = SaveBannersRequestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return apiError(ApiErrorCode.BAD_REQUEST, '잘못된 요청입니다.', 400, JSON.stringify(parsed.error.issues));
    }

    const results = [];
    const cleanupImageKeys = parsed.data.cleanupImageUrls
      .map((imageUrl) => getValidatedStorageImageKey(imageUrl))
      .filter((imageKey) => isTemporaryImageKey(imageKey));

    for (const item of parsed.data.banners) {
      const observedAt = new Date(item.observedAt);
      const newBannerId = randomUUID();
      let movedImageKey: string | null = null;
      let movedImage = false;

      try {
        const sourceImageKey = getValidatedStorageImageKey(item.imageUrl);
        const moved = await moveImageToBanners(sourceImageKey, newBannerId);
        movedImageKey = moved.moved ? moved.imageKey : null;
        movedImage = moved.moved;

        const { banner, isDuplicate } = await createBanner(
          {
            id: newBannerId,
            title: item.title,
            hashtags: item.hashtags,
            subjectType: item.subjectType,
            regionText: item.regionText,
            firstSeenAt: observedAt,
            lastSeenAt: observedAt,
          },
          moved.imageUrl,
        );

        if (isDuplicate && movedImage && movedImageKey) {
          await deleteImageByKey(movedImageKey).catch(() => {});
        }

        results.push({ ...banner, isDuplicate });
      } catch (e) {
        if (movedImage && movedImageKey) {
          await deleteImageByKey(movedImageKey).catch(() => {});
        }
        throw e;
      }
    }

    await Promise.allSettled(
      cleanupImageKeys.map((imageKey) => deleteTempImageByKey(imageKey))
    );

    const hasDuplicate = results.some((r) => r.isDuplicate);
    return apiSuccess(results, hasDuplicate ? ApiSuccessCode.DUPLICATE : ApiSuccessCode.CREATED, 201);
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500, e instanceof Error ? e.message : String(e));
  }
}
