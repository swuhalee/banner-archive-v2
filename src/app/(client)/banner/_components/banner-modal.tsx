'use client'

import Image from 'next/image'
import { useState, type MouseEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import CloseIcon from '@mui/icons-material/Close'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useGetBanner } from '@/src/app/(client)/archive/_hooks/useGetBanner'

type BannerModalProps = {
  bannerId: string | null
  open: boolean
  onClose: () => void
}

function formatKoreanDate(date: Date | string): string {
  const d = new Date(date)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default function BannerModal({ bannerId, open, onClose }: BannerModalProps) {
  const { data: banner, isLoading, isError, error } = useGetBanner(bannerId)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(menuAnchorEl)

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {
          handleMenuClose()
          onClose()
        }}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px', bgcolor: 'var(--surface)', m: 2 } } }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, bgcolor: 'rgba(0,0,0,0.3)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}
            aria-label="닫기"
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {isLoading && (
            <p className="p-6 text-center text-sm text-(--text-muted)">불러오는 중...</p>
          )}

          {banner && (
            <>
              <section className="overflow-hidden rounded-t-2xl bg-(--surface-alt)">
                {banner.imageUrl && (
                  <Image
                    src={banner.imageUrl}
                    alt={banner.regionText}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="block w-full h-auto"
                  />
                )}
              </section>

              <section className="grid gap-4 p-4">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="grid">
                    <p className="text-[12px] text-(--text-muted)">위치</p>
                    <p className="text-[15px] font-semibold">{banner.regionText}</p>
                  </div>

                  <IconButton
                    size="small"
                    aria-label="더보기"
                    aria-controls={menuOpen ? 'banner-more-menu' : undefined}
                    aria-expanded={menuOpen ? 'true' : undefined}
                    aria-haspopup="true"
                    onClick={(event) => {
                      if (menuOpen) {
                        handleMenuClose()
                        return
                      }
                      handleMenuOpen(event)
                    }}
                  >
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>

                  <Menu
                    id="banner-more-menu"
                    anchorEl={menuAnchorEl}
                    open={menuOpen}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    slotProps={{
                      paper: {
                        sx: {
                          minWidth: 120,
                          borderRadius: '10px',
                          border: '1px solid var(--line)',
                          bgcolor: 'var(--surface)',
                          boxShadow: 2,
                        },
                      },
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        handleMenuClose()
                        if (bannerId) router.push(`/report?id=${encodeURIComponent(bannerId)}&from=${encodeURIComponent(searchParams.get('from') ?? '/archive')}`)
                      }}
                      sx={{ fontSize: 13 }}
                    >
                      신고
                    </MenuItem>
                  </Menu>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center gap-2.5 text-[12px] text-(--text-muted)">
                    <span>{formatKoreanDate(banner.firstSeenAt)}에 최초 관측됨</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[12px] text-(--text-muted)">
                    <span>가장 최근인 {formatKoreanDate(banner.lastSeenAt)}에도 관측됨</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[12px] text-(--text-muted)">
                    <span>현재까지 총 {banner.observedCount}회 관측됨</span>
                  </div>
                </div>

                {banner.hashtags.length > 0 && (
                  <div className="grid gap-2">
                    <p className="text-[12px] text-(--text-muted)">카테고리</p>
                    <div className="flex flex-wrap gap-2">
                      {banner.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-(--line) px-2.5 py-1 text-[12px] text-(--text-muted)"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={isError}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled">
          {error instanceof Error ? error.message : '배너를 불러오지 못했습니다.'}
        </Alert>
      </Snackbar>
    </>
  )
}
