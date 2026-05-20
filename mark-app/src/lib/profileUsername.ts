/** Build a unique-ish username for profiles (matches DB helper logic). */
export function usernameFromEmail(
  email: string | undefined,
  userId: string,
): string {
  const base = (email?.split('@')[0] ?? 'angler')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'angler'
  const suffix = userId.replace(/-/g, '').slice(0, 8)
  return `${base}_${suffix}`.slice(0, 40)
}
