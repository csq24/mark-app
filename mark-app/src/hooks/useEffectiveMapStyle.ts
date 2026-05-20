import { useEffect, useState } from 'react'
import {
  resolveEffectiveMapStyle,
  type MapStyleId,
  type MapStylePreference,
} from '../lib/mapStyles'

export function useEffectiveMapStyle(
  preference: MapStylePreference,
  zoom: number,
): MapStyleId {
  const [effective, setEffective] = useState<MapStyleId>(() =>
    resolveEffectiveMapStyle(preference, zoom, 'satellite'),
  )

  useEffect(() => {
    setEffective((prev) => resolveEffectiveMapStyle(preference, zoom, prev))
  }, [preference, zoom])

  return effective
}
