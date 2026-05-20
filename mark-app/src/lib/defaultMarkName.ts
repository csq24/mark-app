/** Auto name when the user drops a mark without extra details. */
export function defaultQuickMarkName(date = new Date()): string {
  const when = date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  return `My Mark · ${when}`
}
