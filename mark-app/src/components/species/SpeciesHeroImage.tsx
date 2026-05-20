import { useState } from 'react'
import { getSpeciesImage } from '../../data/speciesImages'

type SpeciesHeroImageProps = {
  speciesId: string
  speciesName: string
}

export function SpeciesHeroImage({ speciesId, speciesName }: SpeciesHeroImageProps) {
  const meta = getSpeciesImage(speciesId, speciesName)
  const [failed, setFailed] = useState(false)

  if (!meta || failed) return null

  return (
    <figure className="mt-4 overflow-hidden rounded-xl border-2 border-ocean-700 bg-ocean-950">
      <img
        src={meta.src}
        alt={meta.alt}
        width={800}
        height={450}
        className="aspect-[16/10] w-full object-cover"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
      {meta.credit ? (
        <figcaption className="border-t border-ocean-800 px-3 py-1.5 text-[10px] leading-snug text-spray/60">
          {meta.credit}
        </figcaption>
      ) : null}
    </figure>
  )
}
