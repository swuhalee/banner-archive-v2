'use client';

import { SubjectType, SUBJECT_TYPE_LABEL, CandidateBanner } from '@/src/type/banner';

type CandidateCardProps = {
    index: number;
    data: CandidateBanner;
    onChange: (updates: Partial<CandidateBanner>) => void;
};

const CandidateCard = ({ index, data, onChange }: CandidateCardProps) => {
    return (
        <div
            className="grid gap-0 rounded-xl border border-(--line) overflow-hidden"
            style={{ opacity: data.excluded ? 0.45 : 1 }}
        >
            {/* 사진 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={data.imageUrl}
                alt={`현수막 ${index + 1}`}
                className="h-44 w-full object-cover"
            />

            <div className="grid gap-2 p-3">
                {/* 헤더 */}
                <div className="flex items-center gap-2">
                    <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                        style={{ background: data.excluded ? 'var(--text-muted)' : '#111111' }}
                    >
                        {index + 1}
                    </span>
                    <span className="flex-1 text-[13px] font-semibold">현수막 {index + 1}</span>
                    <label className="flex cursor-pointer items-center gap-1 text-[12px] text-(--text-muted)">
                        <input
                            type="checkbox"
                            className="m-0 h-3.25 w-3.25"
                            checked={data.excluded}
                            onChange={(e) => onChange({ excluded: e.target.checked })}
                        />
                        제외
                    </label>
                </div>

                <label className="grid gap-1 text-[12px] font-semibold text-(--text-muted)">
                    제목 / 슬로건
                    <input
                        type="text"
                        placeholder="현수막 핵심 문구"
                        value={data.title}
                        disabled={data.excluded}
                        onChange={(e) => onChange({ title: e.target.value })}
                    />
                </label>

                <label className="grid gap-1 text-[12px] font-semibold text-(--text-muted)">
                    해시태그 (쉼표로 구분)
                    <input
                        type="text"
                        placeholder="키워드1, 키워드2"
                        value={data.hashtagsText}
                        disabled={data.excluded}
                        onChange={(e) => onChange({ hashtagsText: e.target.value })}
                    />
                </label>

                <label className="grid gap-1 text-[12px] font-semibold text-(--text-muted)">
                    주체 유형
                    <select
                        value={data.subjectType}
                        disabled={data.excluded}
                        onChange={(e) => onChange({ subjectType: e.target.value as SubjectType | '' })}
                    >
                        <option value="">선택하세요</option>
                        {Object.entries(SUBJECT_TYPE_LABEL).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </label>

                <label className="grid gap-1 text-[12px] font-semibold text-(--text-muted)">
                    위치
                    <input
                        type="text"
                        value={data.regionText}
                        readOnly
                        className="cursor-default"
                    />
                </label>

                <label className="grid gap-1 text-[12px] font-semibold text-(--text-muted)">
                    관측일
                    <input
                        type="date"
                        value={data.observedAt}
                        readOnly
                        className="cursor-default"
                    />
                </label>
            </div>
        </div>
    );
};

export default CandidateCard;
