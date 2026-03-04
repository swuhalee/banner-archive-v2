import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAdminReportsByBannerId } from '@/src/lib/api/report'
import { REASON_LABEL, STATUS_BADGE, BANNER_STATUS_BADGE } from '../_constants'
import BannerActions from './_components/banner-actions'
import ReportRowActions from './_components/report-row-actions'

type PageProps = { params: Promise<{ id: string }> }

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const { banner, reports } = await getAdminReportsByBannerId(id)
  if (!banner) notFound()

  const bannerBadge = BANNER_STATUS_BADGE[banner.status ?? ''] ?? {
    label: '-',
    color: 'var(--text-muted)',
    bg: 'var(--surface-alt)',
    border: 'var(--line)',
  }

  return (
    <div style={{ padding: 32 }}>
      <Link
        href="/admin/reports"
        style={{ display: 'inline-block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}
      >
        ← 신고 목록으로
      </Link>

      {/* 1. 배너 내용 섹션 */}
      <section style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 20, background: 'var(--surface)', marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 14 }}>배너 정보</div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {banner.imageUrl && (
            <img
              src={banner.imageUrl}
              alt="배너 이미지"
              style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8, background: 'var(--surface-alt)', flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>
              {banner.title ?? '제목 없음'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              {banner.regionText}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: bannerBadge.color,
                  background: bannerBadge.bg,
                  border: `1px solid ${bannerBadge.border}`,
                }}
              >
                {bannerBadge.label}
              </span>
              <BannerActions bannerId={id} currentStatus={banner.status ?? ''} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. 신고 목록 테이블 */}
      <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', margin: '0 0 12px' }}>
        신고 목록 <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>{reports.length}건</span>
      </h2>

      <div style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', background: 'var(--surface)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--surface-alt)' }}>
              {['신고일시', '신고 사유', '상태', '액션'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 14 }}>
                  신고가 없습니다.
                </td>
              </tr>
            )}
            {reports.map((report) => {
              const badge = STATUS_BADGE[report.status] ?? {
                label: report.status,
                color: 'var(--text-muted)',
                bg: 'var(--surface-alt)',
                border: 'var(--line)',
              }
              return (
                <tr key={report.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: 13 }}>
                    {new Date(report.createdAt).toLocaleString('ko-KR')}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text)' }}>
                    <div>{REASON_LABEL[report.reasonType] ?? report.reasonType}</div>
                    {report.reasonDetail && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {report.reasonDetail}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        color: badge.color,
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                      }}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <ReportRowActions reportId={report.id} currentStatus={report.status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
