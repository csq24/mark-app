export function getPhotoExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(fromName)) {
    return fromName === 'jpeg' ? 'jpg' : fromName
  }
  if (file.type.includes('png')) return 'png'
  if (file.type.includes('webp')) return 'webp'
  return 'jpg'
}
