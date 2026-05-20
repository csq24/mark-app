import { ChevronDown, Globe2, Loader2 } from 'lucide-react'
import {
  MAP_STYLE_OPTIONS,
  type MapStylePreference,
} from '../../lib/mapStyles'

type MapExplorerHudProps = {
  breadcrumb: string
  tierHint: string
  placeLoading: boolean
  mapStyleId: MapStylePreference
  onMapStyleChange: (id: MapStylePreference) => void
}

export function MapExplorerHud({
  breadcrumb,
  tierHint,
  placeLoading,
  mapStyleId,
  onMapStyleChange,
}: MapExplorerHudProps) {
  return (
    <div className="pointer-events-auto flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 rounded-xl border-2 border-ocean-600/80 bg-ocean-950/92 px-3 py-2 shadow-lg backdrop-blur-sm">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-action">
          <Globe2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Explorer
          {placeLoading ? (
            <Loader2 className="h-3 w-3 animate-spin text-spray" aria-hidden />
          ) : null}
        </p>
        <p className="truncate text-sm font-bold text-foam">{breadcrumb}</p>
        <p className="text-xs text-spray">{tierHint}</p>
      </div>

      <label className="relative shrink-0">
        <span className="sr-only">Map style</span>
        <select
          value={mapStyleId}
          onChange={(e) => onMapStyleChange(e.target.value as MapStylePreference)}
          className="flex min-h-11 appearance-none items-center rounded-xl border-2 border-ocean-600 bg-ocean-950/92 py-2 pl-3 pr-9 text-sm font-bold text-foam shadow-lg backdrop-blur-sm focus:border-spray focus:outline-none"
        >
          {MAP_STYLE_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-spray"
          aria-hidden
        />
      </label>
    </div>
  )
}
