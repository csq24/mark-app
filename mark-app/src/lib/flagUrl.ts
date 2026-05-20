/** Free flag images (flagcdn.com) — no API key. */

/** Widths offered by flagcdn PNG CDN (w56 etc. are not valid and return 404). */
const FLAGCDN_PNG_WIDTHS = [20, 40, 80, 160, 320, 640, 1280, 2560] as const

export function flagImageUrl(countryCode: string, width = 40): string {
  const code = countryCode.toLowerCase()
  const pngWidth =
    FLAGCDN_PNG_WIDTHS.find((w) => w >= width) ??
    FLAGCDN_PNG_WIDTHS[FLAGCDN_PNG_WIDTHS.length - 1]
  return `https://flagcdn.com/w${pngWidth}/${code}.png`
}

/** SVG scales cleanly at any marker size. */
export function flagSvgUrl(countryCode: string): string {
  const code = countryCode.toLowerCase()
  return `https://flagcdn.com/${code}.svg`
}

export function flagEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase()
  if (code.length !== 2) return '🌍'
  return String.fromCodePoint(
    ...[...code].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65),
  )
}
