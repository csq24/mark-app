import type { Profile } from '../types/database'

export function displayFriendName(
  profile: Pick<Profile, 'full_name' | 'boat_name'> | null,
): string {
  if (profile?.full_name?.trim()) return profile.full_name.trim()
  if (profile?.boat_name?.trim()) return profile.boat_name.trim()
  return 'Angler'
}

export function isDemoFriendEmail(email: string | undefined): boolean {
  return Boolean(email?.endsWith('@mark-app.demo'))
}
