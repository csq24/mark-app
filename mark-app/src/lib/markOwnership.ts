import type { Mark } from '../types/database'

export function isOwnMark(mark: Mark, userId: string | undefined): boolean {
  return Boolean(userId && mark.user_id === userId)
}
