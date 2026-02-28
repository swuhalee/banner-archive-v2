import { storage } from './storage'

export async function uploadBannerImage(imageBase64: string, bannerId: string): Promise<string> {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const path = `${bannerId}.jpg`

    const { error } = await storage.upload(path, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
    })
    if (error) throw new Error(`이미지 업로드를 실패하였습니다: ${error.message}`)

    const { data } = storage.getPublicUrl(path)
    return data.publicUrl
}

export async function deleteBannerImage(bannerId: string): Promise<void> {
    await storage.remove([`${bannerId}.jpg`])
}
