import { supabase } from './supabase'

export const CATCH_PHOTO_BUCKET = 'catch-photos'

export function getPhotoExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(fromName)) {
    return fromName === 'jpeg' ? 'jpg' : fromName
  }
  if (file.type.includes('png')) return 'png'
  if (file.type.includes('webp')) return 'webp'
  return 'jpg'
}

export function catchPhotoStoragePath(
  ownerId: string,
  catchId: string,
  ext: string,
): string {
  return `${ownerId}/${catchId}.${ext}`
}

export function catchPhotoPathFromPublicUrl(url: string): string | null {
  const marker = `/${CATCH_PHOTO_BUCKET}/`
  const index = url.indexOf(marker)
  if (index === -1) return null
  return url.slice(index + marker.length).split('?')[0] ?? null
}

export async function uploadCatchPhoto(
  catchId: string,
  ownerId: string,
  file: File,
): Promise<string> {
  const ext = getPhotoExtension(file)
  const path = catchPhotoStoragePath(ownerId, catchId, ext)

  const { error: uploadError } = await supabase.storage
    .from(CATCH_PHOTO_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data } = supabase.storage.from(CATCH_PHOTO_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteCatchPhoto(photoUrl: string | null): Promise<void> {
  if (!photoUrl) return
  const path = catchPhotoPathFromPublicUrl(photoUrl)
  if (!path) return

  const { error } = await supabase.storage.from(CATCH_PHOTO_BUCKET).remove([path])
  if (error) {
    throw new Error(error.message)
  }
}
