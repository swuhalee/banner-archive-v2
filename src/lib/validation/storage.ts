const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET!
const SUPABASE_HOSTNAME = (() => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!raw) return null
  try {
    return new URL(raw).hostname
  } catch {
    return null
  }
})()

const PUBLIC_PATH_PREFIX = `/storage/v1/object/public/${STORAGE_BUCKET}/`

export function getValidatedStorageImageKey(imageUrl: string): string {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(imageUrl)
  } catch {
    throw new Error('유효한 이미지 URL이 아닙니다.')
  }

  if (parsedUrl.protocol !== 'https:') {
    throw new Error('허용되지 않은 이미지 URL 프로토콜입니다.')
  }

  if (!SUPABASE_HOSTNAME || parsedUrl.hostname !== SUPABASE_HOSTNAME) {
    throw new Error('허용되지 않은 이미지 URL 호스트입니다.')
  }

  if (!parsedUrl.pathname.startsWith(PUBLIC_PATH_PREFIX)) {
    throw new Error('스토리지 퍼블릭 URL 형식이 아닙니다.')
  }

  const imageKey = decodeURIComponent(parsedUrl.pathname.slice(PUBLIC_PATH_PREFIX.length))
  if (!imageKey) throw new Error('스토리지 키를 추출할 수 없습니다.')
  return imageKey
}

export function isTemporaryImageKey(imageKey: string): boolean {
  return imageKey.startsWith('temp/') || imageKey.startsWith('crop/')
}
