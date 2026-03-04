import type { StatusBadge } from '@/src/type/admin'

export const REASON_LABEL: Record<string, string> = {
  privacy: '개인정보 침해',
  portrait: '초상권 침해',
  false_info: '허위 정보',
  other: '기타',
}

export const STATUS_BADGE: Record<string, StatusBadge> = {
  received: { label: '접수됨', color: '#1565c0', bg: '#e3f2fd', border: '#bbdefb' },
  on_hold: { label: '보류', color: '#e65100', bg: '#fff3e0', border: '#ffe0b2' },
  actioned: { label: '처리완료', color: '#2e7d32', bg: '#e8f5e9', border: '#c8e6c9' },
  rejected: { label: '반려', color: 'var(--text-muted)', bg: 'var(--surface-alt)', border: 'var(--line)' },
}

export const BANNER_STATUS_BADGE: Record<string, StatusBadge> = {
  active: { label: '게시중', color: '#2e7d32', bg: '#e8f5e9', border: '#c8e6c9' },
  hidden: { label: '숨김', color: '#c62828', bg: '#ffebee', border: '#ffcdd2' },
  deleted: { label: '삭제됨', color: 'var(--text-muted)', bg: 'var(--surface-alt)', border: 'var(--line)' },
}
