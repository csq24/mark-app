export function formatCatchDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )
  const startOfCatchDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  )
  const dayDiff =
    (startOfToday.getTime() - startOfCatchDay.getTime()) / 86_400_000

  if (dayDiff === 0) return 'Today'
  if (dayDiff === 1) return 'Yesterday'

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

export function formatCatchDetails(
  weightLbs: number | null,
  depthFt: number | null,
  markName: string | null,
): string {
  const parts: string[] = []

  if (weightLbs != null) {
    parts.push(`${weightLbs} lbs`)
  }
  if (depthFt != null) {
    parts.push(`${depthFt} ft deep`)
  }
  if (markName) {
    parts.push(`@ ${markName}`)
  }

  return parts.length > 0 ? parts.join(' · ') : 'No weight or depth recorded'
}
