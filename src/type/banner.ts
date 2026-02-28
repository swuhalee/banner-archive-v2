import { banners } from '../lib/db/schema';

// DB에서 조회한 배너 원본 데이터(imageUrl 없음) —> 중복 판별 등 DB 레이어에서 사용
export type Banner = typeof banners.$inferSelect;

// 갤러리 목록·상세 조회용 -> images 테이블을 JOIN해 imageUrl을 추가한 확장 타입
export type BannerWithImage = Banner & { imageUrl: string | null };

export type BannerInsert = typeof banners.$inferInsert;

export type BannerStatus = 'active' | 'hidden' | 'deleted';

export type SubjectType = 'politician' | 'party' | 'other';

export const SUBJECT_TYPE_LABEL: Record<SubjectType, string> = {
    politician: '정치인',
    party: '정당',
    other: '기타',
};

export const SUBJECT_TYPE_MAP = Object.fromEntries(
    Object.entries(SUBJECT_TYPE_LABEL).map(([k, v]) => [v, k])
) as Record<string, SubjectType>;

// DB insert용 입력 타입 -> createdAt, updatedAt은 DB가 자동 생성하므로 제외하고 id는 호출부에서 직접 생성해 전달
export type CreateBannerInput = Omit<BannerInsert, 'createdAt' | 'updatedAt'>;

// POST /api/banners 요청 바디 -> 클라이언트가 서버로 전송하는 외부 입력값(imageBase64 포함, DB 컬럼과 1:1 대응하지 않음)
export type CreateBannerRequest = {
    title: string | null;
    hashtags: string[];
    subjectType: SubjectType | null;
    regionText: string;
    imageBase64: string;      // data:image/jpeg;base64,...
    observedAt: string;       // YYYY-MM-DD
};

// List 조회 필터
export type BannerListParams = {
    status?: BannerStatus;
    subjectType?: SubjectType;
    regionText?: string;
    sort?: BannerSortOption;
    page?: number;
    limit?: number;
};

export type BannerSortOption = 'recent' | 'first' | 'count';

export type AnalyzedBanner = {
    id: string;
    title: string | null;
    hashtags: string[];
    subjectType: SubjectType | null;
    regionText: string | null;
    image: string; // base64 (data:image/jpeg;base64,...)
};

export type CandidateBanner = {
    id: string;
    title: string;
    hashtagsText: string;
    subjectType: SubjectType | '';
    regionText: string;
    imageUrl: string;
    observedAt: string;
    excluded: boolean;
};
