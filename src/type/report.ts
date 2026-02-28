export enum ReportReasonType {
    Privacy = 'privacy',
    Portrait = 'portrait',
    FalseInfo = 'false_info',
    Other = 'other',
}

export const REASON_OPTIONS: { value: ReportReasonType; label: string }[] = [
    { value: ReportReasonType.Privacy, label: '개인정보 침해' },
    { value: ReportReasonType.Portrait, label: '초상권 침해' },
    { value: ReportReasonType.FalseInfo, label: '잘못된 정보' },
    { value: ReportReasonType.Other, label: '기타' },
]

export type ReportStatus = 'received' | 'under_review' | 'actioned' | 'rejected'

export type CreateReportRequest = {
    bannerId: string
    reasonType: ReportReasonType
    reasonDetail?: string | null
}
