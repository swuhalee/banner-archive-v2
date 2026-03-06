import { apiError, apiSuccess } from "@/src/lib/api/response";
import { ApiErrorCode } from "@/src/type/api";
import { NextRequest } from "next/server";
import { z } from "zod";
import { deleteTempImageByKey, uploadTempImage } from "@/src/lib/storage/banner";
import { isTemporaryImageKey } from "@/src/lib/validation/storage";

const CleanupSchema = z.object({
  imageKeys: z.array(z.string()).default([]),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return apiError(
        ApiErrorCode.BAD_REQUEST,
        "업로드된 사진이 없습니다.",
        400,
        'Expected "image" form field to be a File instance',
      );
    }

    const imageKey = await uploadTempImage(image);
    return apiSuccess(imageKey);
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, "서버 오류가 발생했습니다.", 500, e instanceof Error ? e.message : String(e));
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const parsed = CleanupSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError(ApiErrorCode.BAD_REQUEST, "잘못된 요청입니다.", 400, JSON.stringify(parsed.error.issues));
    }

    const imageKeys = parsed.data.imageKeys
      .filter((imageKey) => isTemporaryImageKey(imageKey))
      .filter((imageKey) => !imageKey.includes(".."));

    await Promise.allSettled(
      imageKeys.map((imageKey) => deleteTempImageByKey(imageKey))
    );

    return apiSuccess({ deletedCount: imageKeys.length });
  } catch (e) {
    return apiError(ApiErrorCode.INTERNAL_ERROR, "서버 오류가 발생했습니다.", 500, e instanceof Error ? e.message : String(e));
  }
}
