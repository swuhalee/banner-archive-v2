import type { SubjectType } from './banner';

export type BBox = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type BlurRegion = {
    type: "face" | "licensePlate";
    bbox: BBox;
};

export type DetectedBanner = {
    tempId: string;
    title: string | null;
    hashtags: string[];
    subjectType: SubjectType | null;
    bbox: BBox;
    confidence: number;
};

export type AnalysisResult = {
    banners: DetectedBanner[];
    privacyRegions: BlurRegion[];
};
