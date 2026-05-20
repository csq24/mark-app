import { MapPin } from 'lucide-react'
import { Marker } from 'react-map-gl/maplibre'

type DraftMarkPinProps = {
  latitude: number
  longitude: number
}

export function DraftMarkPin({ latitude, longitude }: DraftMarkPinProps) {
  return (
    <Marker longitude={longitude} latitude={latitude} anchor="bottom">
      <span className="relative flex flex-col items-center" aria-hidden>
        <span className="absolute -top-1 h-10 w-10 animate-ping rounded-full bg-catch/40" />
        <span className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-foam bg-catch text-catch-text shadow-xl">
          <MapPin className="h-7 w-7" strokeWidth={2.25} />
        </span>
      </span>
    </Marker>
  )
}
