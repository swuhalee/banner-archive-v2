export enum ApiSuccessCode {
    OK = 'OK',
    CREATED = 'CREATED',
    DUPLICATE = 'DUPLICATE',
}

export enum ApiErrorCode {
    NOT_FOUND = 'NOT_FOUND',
    BAD_REQUEST = 'BAD_REQUEST',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    RATE_LIMITED = 'RATE_LIMITED',
}

export type ApiSuccess<T> = {
    success: true;
    code: ApiSuccessCode;
    data: T;
};

export type ApiError = {
    success: false;
    error: {
        code: ApiErrorCode;
        message: string;
    };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
