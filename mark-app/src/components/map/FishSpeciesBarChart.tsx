import type { FishCount } from '../../lib/catchStats'

type FishSpeciesBarChartProps = {
  data: FishCount[]
  title?: string
}

export function FishSpeciesBarChart({
  data,
  title = 'Your catches by species',
}: FishSpeciesBarChartProps) {
  if (data.length === 0) return null

  const max = Math.max(...data.map((row) => row.count))

  return (
    <div className="space-y-2" role="img" aria-label={title}>
      <p className="text-xs font-semibold uppercase tracking-wider text-spray/70">
        {title}
      </p>
      <ul className="space-y-2">
        {data.map((row) => {
          const widthPct = max > 0 ? (row.count / max) * 100 : 0
          return (
            <li key={row.fishType}>
              <div className="mb-0.5 flex items-center justify-between gap-2 text-xs">
                <span className="truncate font-medium text-foam">{row.fishType}</span>
                <span className="shrink-0 tabular-nums text-spray/80">{row.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-mark-800">
                <div
                  className="h-full rounded-full bg-mark-blue"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
