import { NextRequest } from 'next/server'
import { getBanners, createBanner } from '@/src/lib/api/banner'
import { deleteBannerImage } from '@/src/lib/storage/banner'
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
    return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500, e instanceof Error ? e.message : String(e));
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = CreateBannerRequestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return apiError(ApiErrorCode.BAD_REQUEST, '잘못된 요청입니다.', 400, JSON.stringify(parsed.error.issues));
    }

    // 이미지는 클라이언트가 Supabase에 직접 업로드했으므로 DB 저장만 처리
    // SERIALIZABLE 트랜잭션 간 read-write 충돌을 방지하기 위해 순차 처리
    const results = [];
    for (const item of parsed.data) {
      const observedAt = new Date(item.observedAt);
      try {
        const { banner, isDuplicate } = await createBanner(
          {
            id: crypto.randomUUID(),
            title: item.title,
            hashtags: item.hashtags,
            subjectType: item.subjectType,
            regionText: item.regionText,
            firstSeenAt: observedAt,
            lastSeenAt: observedAt,
          },
          item.imageUrl,
        );

        // 중복 판정 시 클라이언트가 업로드한 이미지를 스토리지에서 제거
        if (isDuplicate) {
          await deleteBannerImage(item.imagePath).catch(() => {});
        }

        results.push({ ...banner, isDuplicate });
      } catch (e) {
        // DB 실패 시 업로드된 이미지 롤백
        await deleteBannerImage(item.imagePath).catch(() => {});
        throw e;
      }
    }

    const hasDuplicate = results.some((r) => r.isDuplicate);
    return apiSuccess(results, hasDuplicate ? ApiSuccessCode.DUPLICATE : ApiSuccessCode.CREATED, 201);
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.', 500, e instanceof Error ? e.message : String(e));
  }
}
