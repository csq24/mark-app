import { useState } from 'react'
import { flagEmoji, flagSvgUrl } from '../../lib/flagUrl'

type FlagImageProps = {
  countryCode: string
  className?: string
  width?: number
  height?: number
}

export function FlagImage({
  countryCode,
  className = '',
  width,
  height,
}: FlagImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span
        className={[
          'flex items-center justify-center bg-white text-lg leading-none',
          className,
        ].join(' ')}
        aria-hidden
      >
        {flagEmoji(countryCode)}
      </span>
    )
  }

  return (
    <img
      src={flagSvgUrl(countryCode)}
      alt=""
      width={width}
      height={height}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}
