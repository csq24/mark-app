import type { Profile } from '../types/database'
import { displayFriendName } from './friendDisplay'

export type MarkOwnerProfile = Pick<
  Profile,
  'full_name' | 'boat_name' | 'username'
> | null

export function displayMarkOwner(profile: MarkOwnerProfile): string {
  return displayFriendName(profile)
}

export function sharedByLabel(profile: MarkOwnerProfile): string {
  return `Shared by ${displayMarkOwner(profile)}`
}
