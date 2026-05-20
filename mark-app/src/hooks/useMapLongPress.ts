import { useEffect, type RefObject } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'

type Coords = { latitude: number; longitude: number }

type UseMapLongPressOptions = {
  enabled: boolean
  delayMs?: number
  moveThresholdPx?: number
  onLongPress: (coords: Coords) => void
}

export function useMapLongPress(
  mapRef: RefObject<MapRef | null>,
  {
    enabled,
    delayMs = 550,
    moveThresholdPx = 14,
    onLongPress,
  }: UseMapLongPressOptions,
) {
  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map || !enabled) return

    const canvas = map.getCanvas()
    let timer: ReturnType<typeof setTimeout> | null = null
    let start: { x: number; y: number } | null = null

    const clear = () => {
      if (timer) clearTimeout(timer)
      timer = null
      start = null
    }

    const pointFromTouch = (touch: Touch) => {
      const rect = canvas.getBoundingClientRect()
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    }

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        clear()
        return
      }

      start = pointFromTouch(event.touches[0])
      const origin = start

      timer = setTimeout(() => {
        const lngLat = map.unproject([origin.x, origin.y])
        onLongPress({ latitude: lngLat.lat, longitude: lngLat.lng })
        clear()
      }, delayMs)
    }

    const onTouchMove = (event: TouchEvent) => {
      if (!start || event.touches.length !== 1) return

      const point = pointFromTouch(event.touches[0])
      const dx = point.x - start.x
      const dy = point.y - start.y

      if (Math.hypot(dx, dy) > moveThresholdPx) {
        clear()
      }
    }

    const onTouchEnd = () => clear()

    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchmove', onTouchMove, { passive: true })
    canvas.addEventListener('touchend', onTouchEnd)
    canvas.addEventListener('touchcancel', onTouchEnd)

    return () => {
      clear()
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      canvas.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [mapRef, enabled, delayMs, moveThresholdPx, onLongPress])
}
