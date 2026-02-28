import { z } from 'zod'
import { ReportReasonType } from '../../type/report'

export const CreateReportSchema = z.object({
    bannerId: z.uuid({ error: '유효하지 않은 현수막입니다.' }),
    reasonType: z.nativeEnum(ReportReasonType, { error: '신고 유형을 선택해주세요.' }),
    reasonDetail: z.string().max(1000, '세부 정보는 1000자 이내로 입력해주세요.').optional().nullable(),
})
