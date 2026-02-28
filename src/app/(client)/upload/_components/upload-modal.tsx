'use client';

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import UploadForm, { FormValues } from './upload-form';
import ReviewForm from './review-form';
import AnalysisLoading from './analysis-loading';
import { useAnalyzeBanner } from '../_hooks/useAnalyzeBanner';
import { useSaveBanners } from '../_hooks/useSaveBanners';
import { CandidateBanner } from '@/src/type/banner';

type UploadModalProps = {
    open: boolean;
    onClose: () => void;
};

const STEPS = ['정보 입력', '분석', '결과 확인'];

const UploadModal = ({ open, onClose }: UploadModalProps) => {
    const [activeStep, setActiveStep] = useState(0);
    const { mutateAsync: analyze } = useAnalyzeBanner();
    const { mutateAsync: save, isPending: isSaving } = useSaveBanners();

    // 분석 결과 (Step 2에서 사용)
    const [reviewCandidates, setReviewCandidates] = useState<CandidateBanner[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    function handleClose() {
        onClose();
        setTimeout(() => {
            setActiveStep(0);
            setReviewCandidates([]);
        }, 300);
    }

    // Step 0 → Step 1: 폼 제출 후 AI 분석 시작
    async function handleFormSubmit(data: FormValues) {
        if (data.imageFile) setPreviewUrl(URL.createObjectURL(data.imageFile));
        setActiveStep(1);
        try {
            const candidates = await analyze(data);
            setReviewCandidates(candidates);
            setActiveStep(2);
        } catch (error) {
            setActiveStep(0);
            setErrorMessage(error instanceof Error ? error.message : '분석에 실패했습니다.');
        }
    }

    // Step 2 → 저장
    async function handleSave(candidates: CandidateBanner[]) {
        try {
            const { hasDuplicate } = await save(candidates);
            setSuccessMessage(hasDuplicate
                ? '이미 등록된 현수막이에요. 관측 정보를 업데이트했어요.'
                : '저장이 완료되었어요.'
            );
            setTimeout(handleClose, 1500);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : '저장에 실패했습니다.');
        }
    }

    return (
        <>
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogContent sx={{ p: 3 }}>
                    <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                        {STEPS.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {/* Step 0: 정보 입력 */}
                    {activeStep === 0 && (
                        <UploadForm onSubmit={handleFormSubmit} />
                    )}

                    {/* Step 1: AI 분석 로딩 */}
                    {activeStep === 1 && previewUrl && (
                        <AnalysisLoading imageUrl={previewUrl} />
                    )}

                    {/* Step 2: 분석 결과 확인 */}
                    {activeStep === 2 && (
                        <ReviewForm
                            candidates={reviewCandidates}
                            isSaving={isSaving}
                            onSave={handleSave}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Snackbar
                open={!!successMessage}
                onClose={() => setSuccessMessage(null)}
                autoHideDuration={4000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" variant="filled" onClose={() => setSuccessMessage(null)}>
                    {successMessage}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!errorMessage}
                onClose={() => setErrorMessage(null)}
                autoHideDuration={4000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="error" variant="filled" onClose={() => setErrorMessage(null)}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default UploadModal;
