import { storage } from './storage'
import { randomUUID } from 'crypto'

export function getPublicImageUrl(imageKey: string): string {
  const { data } = storage.getPublicUrl(imageKey)
  return data.publicUrl
}

function isTemporaryImageKey(imageKey: string): boolean {
  return imageKey.startsWith('temp/') || imageKey.startsWith('crop/')
}

export async function deleteImageByKey(imageKey: string): Promise<void> {
  const { error } = await storage.remove([imageKey])
  if (error) throw new Error(`이미지 삭제를 실패하였습니다: ${error.message}`)
}

export async function deleteTempImageByKey(imageKey: string): Promise<void> {
  if (!isTemporaryImageKey(imageKey)) return
  await deleteImageByKey(imageKey)
}

export async function moveImageToBanners(sourceKey: string, bannerId: string): Promise<{ imageKey: string; imageUrl: string; moved: boolean }> {
  if (sourceKey.startsWith('banners/')) {
    return { imageKey: sourceKey, imageUrl: getPublicImageUrl(sourceKey), moved: false }
  }

  if (!isTemporaryImageKey(sourceKey)) {
    throw new Error('이동 가능한 임시 이미지 경로가 아닙니다.')
  }

  const ext = sourceKey.split('.').pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, '') || 'jpg'
  const targetKey = `banners/${bannerId}.${ext}`

  const { error } = await storage.move(sourceKey, targetKey)
  if (error) throw new Error(`이미지 이동을 실패하였습니다: ${error.message}`)

  return {
    imageKey: targetKey,
    imageUrl: getPublicImageUrl(targetKey),
    moved: true,
  }
}

export async function downloadImageByKey(imageKey: string): Promise<Buffer> {
  const { data, error } = await storage.download(imageKey)
  if (error || !data) throw new Error(`이미지 다운로드를 실패하였습니다: ${error?.message ?? 'not found'}`)

  const arrayBuffer = await data.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function uploadTempImage(file: File): Promise<string> {
  const rawExt = file.name.split('.').pop()?.toLowerCase()
  const ext = rawExt?.replace(/[^a-z0-9]/g, '') || 'jpg'
  const fileName = Math.random().toString(36).substring(2)
  const imageKey = `temp/${fileName}.${ext}`

  const { error } = await storage.upload(imageKey, file);
  if (error) throw new Error(`이미지 업로드를 실패하였습니다: ${error.message}`)

  return imageKey;
}

export async function uploadCropImage(buffer: Buffer, bannerId: string): Promise<string> {
  const safeBannerId = bannerId.replace(/[^a-zA-Z0-9_-]/g, '')
  const filePath = `crop/${safeBannerId}-${randomUUID()}.jpg`

  const { error } = await storage.upload(filePath, buffer);
  if (error) throw new Error(`이미지 업로드를 실패하였습니다: ${error.message}`)

  const { data } = storage.getPublicUrl(filePath);
  return data.publicUrl;
}
