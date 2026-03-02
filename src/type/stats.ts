export type RegionLevel = 'sido' | 'sigungu' | 'eupmyeondong'

export type RegionStat = {
  region: string
  count: number
  lat: number | null
  lng: number | null
  sido: string
  sigungu: string | null
  eupmyeondong: string | null
}

export type SummaryScope = {
  sido: string
  sigungu?: string
  eupmyeondong?: string
  name: string
} | null

export type SummaryData = {
  totalBanners: number
  totalObservations: number
  regionCount: number
  topHashtags: { hashtag: string; count: number }[]
  subjectTypeDist: { type: 'politician' | 'party' | 'other' | null; count: number }[]
  monthlyTrend: { month: string; count: number }[]
}
