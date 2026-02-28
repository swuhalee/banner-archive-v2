import { NextResponse } from 'next/server';
import { ApiSuccessCode, ApiErrorCode } from '@/src/type/api';
import type { ApiSuccess, ApiError } from '@/src/type/api';

export function apiSuccess<T>(
    data: T,
    code: ApiSuccessCode = ApiSuccessCode.OK,
    status = 200,
): NextResponse<ApiSuccess<T>> {
    return NextResponse.json({ success: true, code, data }, { status });
}

export function apiError(
    code: ApiErrorCode,
    message: string,
    status = 400,
): NextResponse<ApiError> {
    return NextResponse.json({ success: false, error: { code, message } }, { status });
}
