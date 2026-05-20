import { useCallback, useEffect, useRef, useState } from 'react'

const PULL_THRESHOLD_PX = 72
const MAX_PULL_PX = 120

type UsePullToRefreshOptions = {
  enabled?: boolean
  onRefresh: () => void | Promise<void>
}

export function usePullToRefresh({
  enabled = true,
  onRefresh,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startYRef = useRef(0)
  const pullingRef = useRef(false)
  const pullDistanceRef = useRef(0)
  const onRefreshRef = useRef(onRefresh)

  onRefreshRef.current = onRefresh
  pullDistanceRef.current = pullDistance

  const runRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await onRefreshRef.current()
    } finally {
      setIsRefreshing(false)
      setPullDistance(0)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    function onTouchStart(event: TouchEvent) {
      if (window.scrollY > 8 || isRefreshing) return
      startYRef.current = event.touches[0]?.clientY ?? 0
      pullingRef.current = true
    }

    function onTouchMove(event: TouchEvent) {
      if (!pullingRef.current || isRefreshing) return
      if (window.scrollY > 8) {
        pullingRef.current = false
        setPullDistance(0)
        return
      }

      const currentY = event.touches[0]?.clientY ?? 0
      const delta = currentY - startYRef.current
      if (delta > 0) {
        setPullDistance(Math.min(delta, MAX_PULL_PX))
      } else {
        setPullDistance(0)
      }
    }

    function onTouchEnd() {
      if (!pullingRef.current) return
      pullingRef.current = false

      const shouldRefresh =
        pullDistanceRef.current >= PULL_THRESHOLD_PX && !isRefreshing

      if (shouldRefresh) {
        void runRefresh()
      } else {
        setPullDistance(0)
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [enabled, isRefreshing, runRefresh])

  const progress = Math.min(pullDistance / PULL_THRESHOLD_PX, 1)
  const isPulling = pullDistance > 0 && !isRefreshing

  return {
    pullDistance,
    progress,
    isPulling,
    isRefreshing,
  }
}
