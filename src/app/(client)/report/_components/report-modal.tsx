'use client'

import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useSubmitReport } from '../_hooks/useSubmitReport'
import { ReportReasonType, REASON_OPTIONS } from '@/src/type/report'

type ReportModalProps = {
    bannerId: string | null
    open: boolean
    onClose: () => void
}

const ReportModal = ({ bannerId, open, onClose }: ReportModalProps) => {
    const [reasonType, setReasonType] = useState<ReportReasonType | ''>('')
    const [reasonDetail, setReasonDetail] = useState('')
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const { mutate: submit, isPending } = useSubmitReport()

    function handleClose() {
        if (isPending) return
        onClose()
    }

    function handleSubmit() {
        if (!bannerId || !reasonType) return

        submit(
            { bannerId, reasonType, reasonDetail: reasonDetail || null },
            {
                onSuccess: () => {
                    setSuccessMessage('신고가 접수되었습니다.')
                    setReasonType('')
                    setReasonDetail('')
                    setTimeout(onClose, 1500)
                },
                onError: (error) => {
                    setErrorMessage(error instanceof Error ? error.message : '신고 접수에 실패했습니다.')
                },
            },
        )
    }

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="xs"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: '14px', bgcolor: 'var(--surface)', m: 2 } } }}
            >
                <DialogContent sx={{ p: 3 }}>
                    <h2 className="mb-1 font-bold">신고</h2>
                    <p className="text-[13px] leading-relaxed text-(--text-muted)">
                        잘못된 정보나 문제가 있는 기록인가요? <br />
                        모든 신고는 익명으로 접수되며 안전하게 처리됩니다.
                    </p>

                    <div className="mt-3 grid gap-3">
                        <label className="grid gap-1.5 text-[13px] font-semibold text-(--text-muted)">
                            무엇을 신고하시겠습니까?
                            <select
                                value={reasonType}
                                onChange={(e) => setReasonType(e.target.value as ReportReasonType)}
                                disabled={isPending}
                            >
                                <option value="" disabled>
                                    옵션 선택
                                </option>
                                {REASON_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="grid gap-1.5 text-[13px] font-semibold text-(--text-muted)">
                            세부 정보(옵션)
                            <textarea
                                placeholder="이 현수막에 어떤 문제가 있는지 추가 세부 정보를 알려주세요"
                                value={reasonDetail}
                                onChange={(e) => setReasonDetail(e.target.value)}
                                disabled={isPending}
                            />
                        </label>

                        <div className="inline-actions justify-end">
                            <button className="btn btn-ghost" type="button" onClick={handleClose} disabled={isPending}>
                                취소
                            </button>
                            <button
                                type="button"
                                className="btn btn-solid"
                                onClick={handleSubmit}
                                disabled={isPending || !reasonType}
                            >
                                신고
                            </button>
                        </div>
                    </div>
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
    )
}

export default ReportModal
