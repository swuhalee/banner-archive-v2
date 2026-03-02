'use client'

import PlaceIcon from '@mui/icons-material/Place'
import CloseIcon from '@mui/icons-material/Close'
import type { SummaryScope } from '@/src/type/stats'
import { useGetSummary } from '../_hooks/useGetSummary'
import StatCard from './stat-card'
import MonthlyTrend from './monthly-trend'
import HashtagTreemap from './hashtag-treemap'
import SubjectDist from './subject-dist'
import SummarySkeleton from './summary-section.skeleton'

type Props = {
  scope: SummaryScope
  onClose?: () => void
}

export default function SummarySection({ scope, onClose }: Props) {
  const { data, isFetching, error } = useGetSummary(scope)

  const title = scope ? scope.name : '전국'
  const isPanel = scope !== null

  return (
    <section
      style={{
        border: '1px solid var(--line)',
        borderRadius: 16,
        padding: '20px 24px',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-strong)', margin: 0 }}>
          {isPanel ? (
            <>
              <PlaceIcon style={{ marginRight: 4, color: 'var(--text-muted)', fontSize: 16, verticalAlign: 'middle' }} />
              {title}
            </>
          ) : (
            '전국 통계'
          )}
        </h2>
        {isPanel && onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
              color: 'var(--text-muted)',
              display: 'flex',
            }}
            aria-label="닫기"
          >
            <CloseIcon style={{ fontSize: 18 }} />
          </button>
        )}
      </div>

      {error && (
        <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>
          {error instanceof Error ? error.message : '오류가 발생했습니다.'}
        </p>
      )}

      {isFetching && !data && <SummarySkeleton />}

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <StatCard label="현수막 수" value={data.totalBanners} />
            <StatCard label="총 관측 횟수" value={data.totalObservations} />
            <StatCard label="등록 지역" value={`${data.regionCount}곳`} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>
                월별 등록 추이 <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(최근 12개월)</span>
              </span>
              <MonthlyTrend data={data.monthlyTrend} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>
                주체 유형 분포
              </span>
              <SubjectDist data={data.subjectTypeDist} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>
              해시태그 TOP 10
            </span>
            <HashtagTreemap data={data.topHashtags} />
          </div>
        </>
      )}
    </section>
  )
}
