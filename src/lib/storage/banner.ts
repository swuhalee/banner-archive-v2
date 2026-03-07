import { storage } from './storage'

/**
 * 클라이언트가 Supabase Storage에 직접 업로드할 수 있도록 서명된 URL을 발급함
 * @returns signedUrl — 클라이언트가 PUT 요청을 보낼 URL
 * @returns publicUrl — 업로드 완료 후 사용할 공개 URL
 * @returns path — storage 경로 ({uuid}.jpg), DB 저장 및 롤백 시 삭제용
 */
export async function getSignedUploadUrl(path: string): Promise<{ signedUrl: string; publicUrl: string }> {
  const { data, error } = await storage.createSignedUploadUrl(path)
  if (error || !data) throw new Error(`서명 URL 생성 실패: ${error?.message}`)
  const { data: { publicUrl } } = storage.getPublicUrl(path)
  return { signedUrl: data.signedUrl, publicUrl }
}

export async function deleteBannerImage(path: string): Promise<void> {
  await storage.remove([path])
}
