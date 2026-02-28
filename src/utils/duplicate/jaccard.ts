import type { Banner, CreateBannerInput } from '@/src/type/banner';

/** Set A와 Set B의 자카드 지수 (교집합 / 합집합) */
export function calculateJaccardScore(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 && b.size === 0) return 0;
    const intersection = new Set([...a].filter((x) => b.has(x)));
    const union = new Set([...a, ...b]);
    return intersection.size / union.size;
}

/**
 * Set A와 Set B의 포함률 (교집합 / 더 작은 집합)
 * 한쪽 제목이 다른 제목의 부분집합일 때 높은 점수를 줌
 */
export function calculateOverlapScore(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 && b.size === 0) return 0;
    const intersection = new Set([...a].filter((x) => b.has(x)));
    return intersection.size / Math.min(a.size, b.size);
}

/** 제목 문자열을 어절 단위로 분리 */
function splitIntoWords(text: string): Set<string> {
    return new Set(text.trim().split(/\s+/).filter(Boolean));
}

/**
 * 제목 유사도 (null 처리 포함)
 * 자카드와 포함률 중 높은 값을 사용 → 부분집합 관계인 제목도 높은 점수
 */
function compareTitles(a: string | null, b: string | null): number | null {
    if (a === null && b === null) return null; // 둘 다 없으면 비교 불가 → 가중치에서 제외
    if (a === null || b === null) return 0;    // 한쪽만 없으면 불일치
    const wordsA = splitIntoWords(a);
    const wordsB = splitIntoWords(b);
    return Math.max(calculateJaccardScore(wordsA, wordsB), calculateOverlapScore(wordsA, wordsB));
}

/** 해시태그 유사도 */
function compareHashtags(a: string[], b: string[]): number | null {
    if (a.length === 0 && b.length === 0) return null; // 둘 다 없으면 비교 불가 → 가중치에서 제외
    return calculateJaccardScore(new Set(a), new Set(b));
}

/**
 * 날짜 근접도 점수 (0~1)
 * - 0일: 1.0, 30일 이상: 0.0, 그 사이는 선형 감소
 */
function compareDates(a: Date, b: Date): number {
    const diffMs = Math.abs(a.getTime() - b.getTime());
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - diffDays / 30);
}

const DUPLICATE_THRESHOLD = 0.75;

/**
 * 업로드 대기 배너와 기존 배너의 종합 유사도 (0~1)
 *
 * 기본 가중치: 제목 0.7 / 해시태그 0.2 / 날짜 0.1
 * null 또는 빈 배열인 필드는 가중치에서 제외하고 나머지 가중치로 재정규화
 */
function calculateSimilarityScore(incoming: CreateBannerInput, existing: Banner): number {
    const candidates: Array<{ score: number; weight: number }> = [];

    const title = compareTitles(incoming.title ?? null, existing.title ?? null);
    if (title !== null) candidates.push({ score: title, weight: 0.7 });

    const hashtag = compareHashtags(incoming.hashtags ?? [], existing.hashtags);
    if (hashtag !== null) candidates.push({ score: hashtag, weight: 0.2 });

    candidates.push({ score: compareDates(incoming.firstSeenAt, existing.firstSeenAt), weight: 0.1 });

    const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight === 0) return 0;

    return candidates.reduce((sum, c) => sum + c.score * c.weight, 0) / totalWeight;
}

/**
 * 후보 배너 목록에서 중복으로 판정되는 배너의 ID를 반환
 * 중복이 없으면 null 반환
 */
export function findDuplicateBannerId(incoming: CreateBannerInput, candidates: Banner[]): string | null {
    const match = candidates.find((existing) => calculateSimilarityScore(incoming, existing) >= DUPLICATE_THRESHOLD);
    return match?.id ?? null;
}
