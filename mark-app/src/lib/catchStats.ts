import type { Catch } from '../types/database'

export type FishCount = {
  fishType: string
  count: number
}

export function getCatchesForMark<T extends Catch>(
  catches: T[],
  markId: string,
): T[] {
  return catches
    .filter((entry) => entry.mark_id === markId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
}

export function aggregateFishCounts(catches: Catch[]): FishCount[] {
  const totals = new Map<string, number>()

  for (const entry of catches) {
    const key = entry.fish_type.trim()
    if (!key) continue
    totals.set(key, (totals.get(key) ?? 0) + 1)
  }

  return [...totals.entries()]
    .map(([fishType, count]) => ({ fishType, count }))
    .sort((a, b) => b.count - a.count)
}
