import { MapPin } from 'lucide-react'

/** Fixed center reticle — shows where “drop at crosshair” places a mark. */
export function MapCrosshair() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center"
      aria-hidden
    >
      <div className="relative flex flex-col items-center">
        <div className="absolute h-12 w-12 rounded-full border-2 border-dashed border-action/70 bg-action/10" />
        <div className="absolute h-px w-10 bg-foam/80" />
        <div className="absolute h-10 w-px bg-foam/80" />
        <MapPin className="relative -mt-8 h-10 w-10 text-action drop-shadow-lg" />
      </div>
    </div>
  )
}

