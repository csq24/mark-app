import {
  MARK_TIME_OPTIONS,
  type MarkTimeRange,
} from '../../lib/markTimeFilter'

type MapTimeFilterProps = {
  value: MarkTimeRange
  onChange: (range: MarkTimeRange) => void
}

export function MapTimeFilter({ value, onChange }: MapTimeFilterProps) {
  return (
    <div
      className="pointer-events-auto flex flex-wrap items-center justify-center gap-1 rounded-full border border-mark-700/80 bg-mark-900/95 px-1.5 py-1.5 shadow-xl backdrop-blur-md"
      role="group"
      aria-label="Filter marks by time"
    >
      {MARK_TIME_OPTIONS.map((option) => {
        const active = value === option.id
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={[
              'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm',
              active
                ? 'bg-mark-blue text-mark-950 shadow-md shadow-mark-blue/30'
                : 'text-spray/90 hover:bg-mark-800 hover:text-foam',
            ].join(' ')}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
