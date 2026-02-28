import { describe, it, expect } from 'vitest';
import { calculateJaccardScore, calculateOverlapScore, findDuplicateBannerId } from '../jaccard';
import type { Banner, CreateBannerInput } from '@/src/type/banner';

function makeBanner(overrides: Partial<Banner> = {}): Banner {
    return {
        id: 'banner-1',
        title: null,
        hashtags: [],
        subjectType: null,
        regionText: '서울',
        firstSeenAt: new Date('2024-01-01'),
        lastSeenAt: new Date('2024-01-01'),
        observedCount: 1,
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        ...overrides,
    } as unknown as Banner;
}

function makeIncoming(overrides: Partial<CreateBannerInput> = {}): CreateBannerInput {
    return {
        title: null,
        hashtags: [],
        subjectType: null,
        regionText: '서울',
        firstSeenAt: new Date('2024-01-01'),
        lastSeenAt: new Date('2024-01-01'),
        observedCount: 1,
        status: 'active',
        ...overrides,
    } as CreateBannerInput;
}

describe('calculateJaccardScore', () => {
    it('두 집합이 모두 비어있으면 0을 반환한다', () => {
        expect(calculateJaccardScore(new Set(), new Set())).toBe(0);
    });

    it('두 집합이 동일하면 1을 반환한다', () => {
        const s = new Set(['A', 'B', 'C']);
        expect(calculateJaccardScore(s, s)).toBe(1);
    });

    it('완전히 다른 집합이면 0을 반환한다', () => {
        expect(calculateJaccardScore(new Set(['A', 'B']), new Set(['C', 'D']))).toBe(0);
    });

    it('한 집합이 비어있으면 0을 반환한다', () => {
        expect(calculateJaccardScore(new Set(), new Set(['A']))).toBe(0);
        expect(calculateJaccardScore(new Set(['A']), new Set())).toBe(0);
    });

    it('일부 겹치는 경우 교집합/합집합을 반환한다', () => {
        // {A,B,C} ∩ {B,C,D} = {B,C}, union = {A,B,C,D} → 2/4 = 0.5
        const a = new Set(['A', 'B', 'C']);
        const b = new Set(['B', 'C', 'D']);
        expect(calculateJaccardScore(a, b)).toBe(0.5);
    });

    it('단일 공통 원소', () => {
        // {A} ∩ {A,B} = {A}, union = {A,B} → 1/2 = 0.5
        expect(calculateJaccardScore(new Set(['A']), new Set(['A', 'B']))).toBe(0.5);
    });
});

describe('calculateOverlapScore', () => {
    it('두 집합이 모두 비어있으면 0을 반환한다', () => {
        expect(calculateOverlapScore(new Set(), new Set())).toBe(0);
    });

    it('두 집합이 동일하면 1을 반환한다', () => {
        const s = new Set(['A', 'B']);
        expect(calculateOverlapScore(s, s)).toBe(1);
    });

    it('완전히 다른 집합이면 0을 반환한다', () => {
        expect(calculateOverlapScore(new Set(['A', 'B']), new Set(['C', 'D']))).toBe(0);
    });

    it('작은 집합이 큰 집합의 부분집합이면 1을 반환한다', () => {
        // {A} ⊆ {A,B,C} → 교집합/min(1,3) = 1/1 = 1.0
        expect(calculateOverlapScore(new Set(['A']), new Set(['A', 'B', 'C']))).toBe(1);
        expect(calculateOverlapScore(new Set(['A', 'B', 'C']), new Set(['A']))).toBe(1);
    });

    it('일부 겹치는 경우 교집합/최솟값을 반환한다', () => {
        // {A,B} ∩ {B,C} = {B}, min(2,2) = 2 → 1/2 = 0.5
        expect(calculateOverlapScore(new Set(['A', 'B']), new Set(['B', 'C']))).toBe(0.5);
    });
});

describe('findDuplicateBannerId', () => {
    it('후보가 없으면 null을 반환한다', () => {
        const incoming = makeIncoming({ title: '홍길동 후보' });
        expect(findDuplicateBannerId(incoming, [])).toBeNull();
    });

    it('완전히 동일한 배너는 중복으로 판정한다', () => {
        // title: 1.0 (w=0.7), hashtag: 1.0 (w=0.2), date: 1.0 (w=0.1) → 1.0 ≥ 0.75
        const date = new Date('2024-01-01');
        const incoming = makeIncoming({ title: '홍길동 후보', hashtags: ['선거', '2024'], firstSeenAt: date });
        const existing = makeBanner({ id: 'banner-1', title: '홍길동 후보', hashtags: ['선거', '2024'], firstSeenAt: date });
        expect(findDuplicateBannerId(incoming, [existing])).toBe('banner-1');
    });

    it('제목이 완전히 다르면 중복으로 판정하지 않는다', () => {
        // title: 0 (w=0.7), date: 1.0 (w=0.1) → (0*0.7+1*0.1)/0.8 = 0.125 < 0.75
        const date = new Date('2024-01-01');
        const incoming = makeIncoming({ title: '김영희 의원', firstSeenAt: date });
        const existing = makeBanner({ id: 'banner-1', title: '홍길동 후보', firstSeenAt: date });
        expect(findDuplicateBannerId(incoming, [existing])).toBeNull();
    });

    it('부분 제목이 전체 제목에 포함되면 (포함률=1.0) 중복으로 판정한다', () => {
        // "홍길동" ⊆ "홍길동 후보" → overlap=1/1=1.0, max(jaccard=0.5, overlap=1.0)=1.0
        // (1.0*0.7 + 1.0*0.1) / 0.8 = 1.0 ≥ 0.75
        const date = new Date('2024-01-01');
        const incoming = makeIncoming({ title: '홍길동', firstSeenAt: date });
        const existing = makeBanner({ id: 'banner-1', title: '홍길동 후보', firstSeenAt: date });
        expect(findDuplicateBannerId(incoming, [existing])).toBe('banner-1');
    });

    it('날짜가 크게 차이 나도 제목이 같으면 중복으로 판정한다', () => {
        // 45일 차이: date score = max(0, 1-45/30) = 0
        // (1.0*0.7 + 0*0.1) / 0.8 = 0.875 ≥ 0.75
        const incoming = makeIncoming({ title: '홍길동 후보', firstSeenAt: new Date('2024-01-01') });
        const existing = makeBanner({ id: 'banner-1', title: '홍길동 후보', firstSeenAt: new Date('2024-02-15') });
        expect(findDuplicateBannerId(incoming, [existing])).toBe('banner-1');
    });

    it('제목이 부분 일치하고 날짜가 같으면 임계값을 넘어 중복으로 판정한다', () => {
        // "서울 선거 홍길동 후보" vs "서울 선거 홍길동 의원"
        // jaccard = 3/5 = 0.6, overlap = 3/4 = 0.75 → max = 0.75
        // (0.75*0.7 + 1.0*0.1) / 0.8 = 0.781 ≥ 0.75
        const date = new Date('2024-01-01');
        const incoming = makeIncoming({ title: '서울 선거 홍길동 후보', firstSeenAt: date });
        const existing = makeBanner({ id: 'banner-1', title: '서울 선거 홍길동 의원', firstSeenAt: date });
        expect(findDuplicateBannerId(incoming, [existing])).toBe('banner-1');
    });

    it('제목 유사도가 낮으면 중복으로 판정하지 않는다', () => {
        // "서울 선거" vs "서울 총선": max(jaccard=1/3, overlap=1/2) = 0.5
        // (0.5*0.7 + 1.0*0.1) / 0.8 = 0.5625 < 0.75
        const date = new Date('2024-01-01');
        const incoming = makeIncoming({ title: '서울 선거', firstSeenAt: date });
        const existing = makeBanner({ id: 'banner-1', title: '서울 총선', firstSeenAt: date });
        expect(findDuplicateBannerId(incoming, [existing])).toBeNull();
    });

    it('인커밍 제목이 null이고 기존 배너에 제목이 있으면 중복으로 판정하지 않는다', () => {
        // compareTitles(null, "홍길동 후보") → 0 (한쪽만 null)
        // (0*0.7 + 1.0*0.1) / 0.8 = 0.125 < 0.75
        const date = new Date('2024-01-01');
        const incoming = makeIncoming({ title: null, firstSeenAt: date });
        const existing = makeBanner({ id: 'banner-1', title: '홍길동 후보', firstSeenAt: date });
        expect(findDuplicateBannerId(incoming, [existing])).toBeNull();
    });

    it('둘 다 제목/해시태그가 없으면 날짜만으로 중복 판정한다', () => {
        // title: null (제외), hashtag: null (제외), date: 1.0 (w=0.1)
        // totalWeight = 0.1, score = 1.0 ≥ 0.75
        const date = new Date('2024-01-01');
        const incoming = makeIncoming({ title: null, hashtags: [], firstSeenAt: date });
        const existing = makeBanner({ id: 'banner-1', title: null, hashtags: [], firstSeenAt: date });
        expect(findDuplicateBannerId(incoming, [existing])).toBe('banner-1');
    });

    it('여러 후보 중 임계값을 넘는 첫 번째 배너 ID를 반환한다', () => {
        const date = new Date('2024-01-01');
        const incoming = makeIncoming({ title: '홍길동 후보', firstSeenAt: date });
        const noMatch = makeBanner({ id: 'banner-no', title: '김영희 의원', firstSeenAt: date });
        const match = makeBanner({ id: 'banner-yes', title: '홍길동 후보', firstSeenAt: date });
        expect(findDuplicateBannerId(incoming, [noMatch, match])).toBe('banner-yes');
    });

    it('해시태그와 제목이 모두 다르면 중복으로 판정하지 않는다', () => {
        // title: 0 (w=0.7), hashtag: 0 (w=0.2), date: 1.0 (w=0.1) → 0.1/1.0 = 0.1 < 0.75
        const date = new Date('2024-01-01');
        const incoming = makeIncoming({ title: '김영희 의원', hashtags: ['총선'], firstSeenAt: date });
        const existing = makeBanner({ id: 'banner-1', title: '홍길동 후보', hashtags: ['선거'], firstSeenAt: date });
        expect(findDuplicateBannerId(incoming, [existing])).toBeNull();
    });

    it('해시태그가 부분 일치해도 제목이 동일하면 중복으로 판정한다', () => {
        // title: 1.0 (w=0.7), hashtag: jaccard({"선거","2024"},{"선거","총선"})=1/3≈0.33 (w=0.2), date: 1.0 (w=0.1)
        // (1.0*0.7 + 0.33*0.2 + 1.0*0.1) / 1.0 ≈ 0.867 ≥ 0.75
        const date = new Date('2024-01-01');
        const incoming = makeIncoming({ title: '홍길동 후보', hashtags: ['선거', '2024'], firstSeenAt: date });
        const existing = makeBanner({ id: 'banner-1', title: '홍길동 후보', hashtags: ['선거', '총선'], firstSeenAt: date });
        expect(findDuplicateBannerId(incoming, [existing])).toBe('banner-1');
    });
});
