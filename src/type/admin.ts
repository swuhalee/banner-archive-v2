export type ReportStatus = 'received' | 'on_hold' | 'actioned' | 'rejected'
export type BannerStatus = 'active' | 'hidden' | 'deleted'

export interface LoginInput {
  email: string
  password: string
}

export interface UpdateReportStatusInput {
  reportId: string
  reportStatus: string
  bannerStatus?: string | null
}

export type StatusBadge = {
  label: string
  color: string
  bg: string
  border: string
}
