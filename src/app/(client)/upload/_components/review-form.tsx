'use client';

import { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import CandidateCard from './candidate-card';
import { CandidateBanner } from '@/src/type/banner';

type ReviewFormProps = {
    candidates: CandidateBanner[];
    isSaving: boolean;
    onSave: (candidates: CandidateBanner[]) => void;
};

const ReviewForm = ({ candidates: initialCandidates, isSaving, onSave }: ReviewFormProps) => {
    const [candidates, setCandidates] = useState<CandidateBanner[]>(initialCandidates);

    function handleChange(id: string, updates: Partial<CandidateBanner>) {
        setCandidates((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
        );
    }

    const activeCount = candidates.filter((c) => !c.excluded).length;

    return (
        <div className="grid gap-4">
            <div className="flex flex-col gap-3">
                {candidates.map((candidate, index) => (
                    <CandidateCard
                        key={candidate.id}
                        index={index}
                        data={candidate}
                        onChange={(updates) => handleChange(candidate.id, updates)}
                    />
                ))}
            </div>

            <div className="flex items-center justify-between border-t border-(--line) pt-3">
                <span className="text-[13px] text-(--text-muted)">
                    {activeCount}개 저장 예정
                    {candidates.length !== activeCount && ` (${candidates.length - activeCount}개 제외)`}
                </span>
                <button
                    className="btn btn-solid"
                    onClick={() => onSave(candidates)}
                    disabled={isSaving || activeCount === 0}
                >
                    {isSaving
                        ? <CircularProgress size={16} color="inherit" />
                        : '저장'
                    }
                </button>
            </div>
        </div>
    );
};

export default ReviewForm;
