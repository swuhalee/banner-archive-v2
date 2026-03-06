import { z } from 'zod'

export const BannerSchema = z.object({
    title: z.string().nullable(),
    hashtags: z.array(z.string()),
    subjectType: z.enum(['politician', 'party', 'other']).nullable(),
    regionText: z.string().min(1, '지역 정보가 없습니다.'),
    imageBase64: z.string().min(1, '이미지 데이터가 없습니다.'),
    observedAt: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)'),
})

export const CreateBannerRequestSchema = z.array(BannerSchema).min(1, '저장할 항목이 없습니다.')
