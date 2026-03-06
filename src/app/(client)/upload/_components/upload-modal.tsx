'use client';

import { useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import UploadForm, { UploadFormValues } from './upload-form';
import ReviewForm from './review-form';
import AnalysisLoading from './analysis-loading';
import { useAnalyzeBanner } from '../_hooks/useAnalyzeBanner';
import { useDeleteImage } from '../_hooks/useDeleteImage';
import { useSaveBanners } from '../_hooks/useSaveBanners';
import { CandidateBanner } from '@/src/type/banner';
import { useToast } from '@/src/providers/toast-provider';

type UploadModalProps = {
  open: boolean;
  onClose: () => void;
};

const STEPS = ['정보 입력', '분석', '결과 확인'];
const EMPTY_ANALYSIS_MESSAGE = '현수막을 찾지 못했습니다. 다른 사진으로 다시 시도해주세요.';

const UploadModal = ({ open, onClose }: UploadModalProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const { mutateAsync: analyze } = useAnalyzeBanner();
  const { mutate: deleteImage } = useDeleteImage();
  const { mutateAsync: save, isPending: isSaving } = useSaveBanners();
  const { showError, showSuccess } = useToast();

  // 분석 결과 (Step 2에서 사용)
  const [reviewCandidates, setReviewCandidates] = useState<CandidateBanner[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [analysisErrorMessage, setAnalysisErrorMessage] = useState('분석에 실패했습니다. 다시 시도해주세요.');

  const previewUrlRef = useRef<string | null>(null);
  // 마지막 제출 폼: 재시도 시 동일 입력값으로 다시 분석 요청
  const savedFormData = useRef<UploadFormValues | null>(null);
  // 임시 업로드 키: 분석 실패 시 재업로드 없이 재시도하기 위해 보관
  const savedImageKey = useRef<string | null>(null);

  function revokePreviewUrl() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }

  function handleClose() {
    // 모달을 닫는 시점에 남아있는 temp 이미지를 정리한다.
    const imageKeyToCleanup = savedImageKey.current;
    onClose();
    if (imageKeyToCleanup) {
      deleteImage({ imageKeys: [imageKeyToCleanup] });
    }
    setTimeout(() => {
      revokePreviewUrl();
      setPreviewUrl(null);
      setActiveStep(0);
      setAnalysisFailed(false);
      setAnalysisErrorMessage('분석에 실패했습니다. 다시 시도해주세요.');
      setReviewCandidates([]);
      savedImageKey.current = null;
    }, 300);
  }

  // Step 0 → Step 1: 폼 제출 후 AI 분석 시작
  async function handleFormSubmit(data: UploadFormValues, useCachedImageKey = false) {
    savedFormData.current = data;
    // 신규 제출이면 기존 temp key는 폐기, 재시도면 기존 key를 재사용한다.
    if (!useCachedImageKey) savedImageKey.current = null;
    revokePreviewUrl();
    if (data.imageFile) {
      const url = URL.createObjectURL(data.imageFile);
      previewUrlRef.current = url;
      setPreviewUrl(url);
    }
    setActiveStep(1);
    setAnalysisFailed(false);
    setAnalysisErrorMessage('분석에 실패했습니다. 다시 시도해주세요.');
    try {
      // onImageKeyReady: 업로드가 성공하는 즉시 key를 캐시해 네트워크/분석 실패에도 재사용 가능하게 한다.
      const { imageKey, candidates } = await analyze({
        form: data,
        reuseImageKey: useCachedImageKey ? savedImageKey.current : null,
        onImageKeyReady: (nextImageKey) => {
          savedImageKey.current = nextImageKey;
        },
      });
      savedImageKey.current = imageKey;

      if (candidates.length === 0) {
        setAnalysisFailed(true);
        setAnalysisErrorMessage(EMPTY_ANALYSIS_MESSAGE);
        showError(EMPTY_ANALYSIS_MESSAGE);
        return;
      }
      // 분석 성공(후보 있음) 시 서버가 temp를 정리하므로 클라이언트 캐시도 비운다.
      savedImageKey.current = null;
      setReviewCandidates(candidates);
      setActiveStep(2);
    } catch (error) {
      setAnalysisFailed(true);
      const message = error instanceof Error ? error.message : '분석에 실패했습니다.';
      setAnalysisErrorMessage(message);
      showError(message);
    }
  }

  async function handleRetry() {
    // 마지막 폼 + 캐시된 temp key로 재분석 (재업로드 방지)
    if (savedFormData.current) await handleFormSubmit(savedFormData.current, true);
  }

  // Step 2 → 저장
  async function handleSave(candidates: CandidateBanner[]) {
    try {
      const { hasDuplicate } = await save(candidates);
      showSuccess(hasDuplicate
        ? '이미 등록된 현수막이에요. 관측 정보를 업데이트했어요.'
        : '저장이 완료되었어요.'
      );
      setTimeout(handleClose, 1500);
    } catch (error) {
      showError(error instanceof Error ? error.message : '저장에 실패했습니다.');
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
              <p className="text-sm text-(--text-muted)">{analysisErrorMessage}</p>
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

    </>
  );
};

export default UploadModal;
