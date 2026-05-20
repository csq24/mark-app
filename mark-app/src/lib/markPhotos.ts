import { getPhotoExtension } from './photoStorage'
import { supabase } from './supabase'

export const MARK_PHOTO_BUCKET = 'mark-photos'

export function markPhotoStoragePath(
  ownerId: string,
  markId: string,
  ext: string,
): string {
  return `${ownerId}/${markId}.${ext}`
}

export function markPhotoPathFromPublicUrl(url: string): string | null {
  const marker = `/${MARK_PHOTO_BUCKET}/`
  const index = url.indexOf(marker)
  if (index === -1) return null
  return url.slice(index + marker.length).split('?')[0] ?? null
}

export async function uploadMarkPhoto(
  markId: string,
  ownerId: string,
  file: File,
): Promise<string> {
  const ext = getPhotoExtension(file)
  const path = markPhotoStoragePath(ownerId, markId, ext)

  const { error: uploadError } = await supabase.storage
    .from(MARK_PHOTO_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data } = supabase.storage.from(MARK_PHOTO_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteMarkPhoto(photoUrl: string | null): Promise<void> {
  if (!photoUrl) return
  const path = markPhotoPathFromPublicUrl(photoUrl)
  if (!path) return

  const { error } = await supabase.storage
    .from(MARK_PHOTO_BUCKET)
    .remove([path])

  if (error) {
    throw new Error(error.message)
  }
}
