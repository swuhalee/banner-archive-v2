import Link from 'next/link'
import { getAdminReportsByBanner } from '@/src/lib/api/report'
import { toAdminPath } from '@/src/lib/auth/admin-path'
import { STATUS_BADGE } from './_constants'
import ReportTabNav from './_components/report-tab-nav'

type PageProps = {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const { status, page: pageStr } = await searchParams
  const page = pageStr ? Number(pageStr) : 1
  const validStatus = ['received', 'on_hold', 'actioned', 'rejected'].includes(status ?? '')
    ? (status as 'received' | 'on_hold' | 'actioned' | 'rejected')
    : undefined

  const { groups, total } = await getAdminReportsByBanner({ status: validStatus, page })
  const totalPages = Math.ceil(total / 20)

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-strong)', margin: '0 0 20px' }}>
        신고 관리
      </h1>

      <ReportTabNav status={status} />

      <div style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', background: 'var(--surface)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--surface-alt)' }}>
              {['썸네일', '배너', '신고 현황', '최근 신고일', ''].map((h) => (
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
            {groups.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 14 }}
                >
                  신고가 없습니다.
                </td>
              </tr>
            )}
            {groups.map((group) => {
              const counts: { key: string; count: number }[] = [
                { key: 'received', count: group.receivedCount },
                { key: 'on_hold', count: group.underReviewCount },
                { key: 'actioned', count: group.actionedCount },
                { key: 'rejected', count: group.rejectedCount },
              ]

              return (
                <tr key={group.bannerId} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 14px' }}>
                    {group.imageUrl ? (
                      <img
                        src={group.imageUrl}
                        alt="배너"
                        style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 6, display: 'block' }}
                      />
                    ) : (
                      <div style={{ width: 64, height: 48, background: 'var(--surface-alt)', borderRadius: 6 }} />
                    )}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div
                      style={{
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: 500,
                        color: 'var(--text-strong)',
                      }}
                    >
                      {group.bannerTitle ?? '제목 없음'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {group.bannerRegionText}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-strong)' }}>
                        {group.reportCount}건
                      </span>
                      {counts.filter(c => c.count > 0).map(({ key, count }) => {
                        const badge = STATUS_BADGE[key]
                        return (
                          <span
                            key={key}
                            style={{
                              display: 'inline-block',
                              padding: '2px 7px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              color: badge.color,
                              background: badge.bg,
                              border: `1px solid ${badge.border}`,
                            }}
                          >
                            {badge.label} {count}
                          </span>
                        )
                      })}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: 13 }}>
                    {new Date(group.latestAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Link
                      href={toAdminPath(`/reports/${group.bannerId}`)}
                      className="btn btn-ghost"
                      style={{ height: 32, padding: '0 12px', fontSize: 13 }}
                    >
                      신고 목록
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`${toAdminPath('/reports')}?${status ? `status=${status}&` : ''}page=${p}`}
              className={p === page ? 'btn btn-solid' : 'btn btn-ghost'}
              style={{ height: 34, padding: '0 12px', fontSize: 13 }}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
