import type { Mark } from '../types/database'

export type MarkTimeRange = '12h' | 'day' | 'week' | 'month' | 'year' | 'all'

export const MARK_TIME_OPTIONS: { id: MarkTimeRange; label: string }[] = [
  { id: '12h', label: '12 Hours' },
  { id: 'day', label: 'Last Day' },
  { id: 'week', label: 'Last Week' },
  { id: 'month', label: 'Last Month' },
  { id: 'year', label: 'Last Year' },
  { id: 'all', label: 'All Time' },
]

const RANGE_MS: Record<Exclude<MarkTimeRange, 'all'>, number> = {
  '12h': 12 * 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
}

export function filterMarksByTime(
  marks: Mark[],
  range: MarkTimeRange,
): Mark[] {
  if (range === 'all') return marks
  const cutoff = Date.now() - RANGE_MS[range]
  return marks.filter((mark) => new Date(mark.created_at).getTime() >= cutoff)
}
