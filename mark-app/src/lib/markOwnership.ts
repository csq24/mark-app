import type { Mark, MarkWithOwner } from '../types/database'

export function isOwnMark(
  mark: Mark | MarkWithOwner,
  userId: string | undefined,
): boolean {
  return Boolean(userId && mark.user_id === userId)
}
