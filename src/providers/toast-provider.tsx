'use client'

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

type ToastState = {
  open: boolean
  message: string
  severity: 'success' | 'error'
}

type ToastContextValue = {
  showError: (message: string) => void
  showSuccess: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'error' })
  const lastToastRef = useRef<{ message: string; severity: 'success' | 'error'; at: number } | null>(null)

  const showToast = useCallback((message: string, severity: 'success' | 'error') => {
    const now = Date.now()
    const lastToast = lastToastRef.current

    // 같은 토스트가 짧은 시간 내에 반복되면 중복 표시를 막음
    if (lastToast && lastToast.message === message && lastToast.severity === severity && now - lastToast.at < 4000) return

    lastToastRef.current = { message, severity, at: now }
    setToast({ open: true, message, severity })
  }, [])

  const showError = useCallback((message: string) => {
    showToast(message, 'error')
  }, [showToast])

  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success')
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showError, showSuccess }}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
