'use client';

import { useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
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
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const previewUrlRef = useRef<string | null>(null);
  const savedFormData = useRef<FormValues | null>(null);

  function revokePreviewUrl() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      revokePreviewUrl();
      setPreviewUrl(null);
      setActiveStep(0);
      setAnalysisFailed(false);
      setReviewCandidates([]);
    }, 300);
  }

  // Step 0 → Step 1: 폼 제출 후 AI 분석 시작
  async function handleFormSubmit(data: FormValues) {
    savedFormData.current = data;
    revokePreviewUrl();
    if (data.imageFile) {
      const url = URL.createObjectURL(data.imageFile);
      previewUrlRef.current = url;
      setPreviewUrl(url);
    }
    setActiveStep(1);
    setAnalysisFailed(false);
    try {
      const candidates = await analyze(data);
      setReviewCandidates(candidates);
      setActiveStep(2);
    } catch (error) {
      setAnalysisFailed(true);
      setErrorMessage(error instanceof Error ? error.message : '분석에 실패했습니다.');
    }
  }

  async function handleRetry() {
    if (savedFormData.current) await handleFormSubmit(savedFormData.current);
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
      {/* 이미지 분석 중일 때는 모달이 닫히지 않게 undefined 전달함 */}
      <Dialog open={open} onClose={activeStep === 1 ? undefined : handleClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: { m: { xs: 0, sm: 2 }, width: { xs: '100%', sm: undefined }, maxHeight: { xs: '100dvh', sm: undefined }, borderRadius: { xs: 0, sm: undefined } } } }}>
        <DialogContent sx={{ p: 3 }}>
          <Stepper
            activeStep={activeStep}
            sx={{
              mb: 3,
              '& .MuiStepIcon-root': { fontSize: { xs: 18, sm: 24 } },
              '& .MuiStepLabel-label': { fontSize: { xs: 13, sm: 14 } },
              '& .MuiStepConnector-line': { borderTopWidth: { xs: 1, sm: 1 } },
            }}
          >
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
          {activeStep === 1 && !analysisFailed && previewUrl && (
            <AnalysisLoading imageUrl={previewUrl} />
          )}
          {activeStep === 1 && analysisFailed && (
            <div className="flex flex-col items-center gap-4 py-10">
              <p className="text-sm text-(--text-muted)">분석에 실패했습니다. 다시 시도해주세요.</p>
              <button className="btn btn-solid" onClick={handleRetry}>다시 시도</button>
            </div>
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
