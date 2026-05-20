import { ChevronDown } from 'lucide-react'
import {
  MAP_STYLE_OPTIONS,
  type MapStylePreference,
} from '../../lib/mapStyles'

type MapStyleSelectProps = {
  value: MapStylePreference
  onChange: (id: MapStylePreference) => void
}

export function MapStyleSelect({ value, onChange }: MapStyleSelectProps) {
  return (
    <label className="pointer-events-auto relative">
      <span className="sr-only">Map style</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as MapStylePreference)}
        className="min-h-9 appearance-none rounded-full border border-mark-700 bg-mark-950/95 py-1.5 pl-3 pr-8 text-xs font-semibold text-foam shadow-lg backdrop-blur-md focus:border-mark-blue focus:outline-none"
      >
        {MAP_STYLE_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-spray"
        aria-hidden
      />
    </label>
  )
}
