export const FORUM_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'offshore', label: 'Offshore' },
  { id: 'inshore', label: 'Inshore' },
  { id: 'charters', label: 'Charters' },
  { id: 'gear', label: 'Gear' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'general', label: 'General' },
] as const

export type ForumCategoryId = Exclude<
  (typeof FORUM_CATEGORIES)[number]['id'],
  'all'
>

export type ForumSort = 'newest' | 'active'

export function getCategoryLabel(id: string): string {
  return FORUM_CATEGORIES.find((c) => c.id === id)?.label ?? id
}
