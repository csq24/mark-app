const DEFAULT_ERROR =
  'Location unavailable. Enable GPS or move to an open area on deck.'

export function formatGeolocationError(message: string | undefined): string {
  if (!message) return DEFAULT_ERROR

  const lower = message.toLowerCase()

  if (lower.includes('timeout')) {
    return 'GPS is taking a while — you can still use the map and drop marks manually.'
  }
  if (lower.includes('denied') || lower.includes('permission')) {
    return 'Location permission denied. Allow location in browser settings to center on you.'
  }
  if (lower.includes('unavailable')) {
    return 'GPS signal unavailable. Pan the map to mark a spot or try again on deck.'
  }

  return message
}
