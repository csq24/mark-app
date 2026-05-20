import {
  AlertCircle,
  Anchor,
  Fish,
  Loader2,
  MapPin,
  PlusCircle,
  RefreshCw,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { CatchCard } from '../components/logbook/CatchCard'
import { PageHeader } from '../components/layout/PageHeader'
import { useCatches } from '../hooks/useCatches'
import { useMarks } from '../hooks/useMarks'
import { useAuth } from '../hooks/useAuth'
import { usePullToRefresh } from '../hooks/usePullToRefresh'

function SectionSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <ul className="space-y-3" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <li
          key={i}
          className="h-24 animate-pulse rounded-2xl border-2 border-ocean-700 bg-ocean-900"
        />
      ))}
    </ul>
  )
}

export function LogBookPage() {
  const { user, loading: authLoading } = useAuth()
  const {
    catches,
    loading: catchesLoading,
    error: catchesError,
    refetch: refetchCatches,
    deleteCatch,
    deletingId,
    isAuthenticated,
  } = useCatches()
  const {
    marks,
    loading: marksLoading,
    error: marksError,
    refetch: refetchMarks,
  } = useMarks()

  const loading = authLoading || catchesLoading || marksLoading
  const refreshing = loading && (catches.length > 0 || marks.length > 0)

  function handleRefresh() {
    void refetchCatches()
    void refetchMarks()
  }

  const { pullDistance, progress, isPulling, isRefreshing } = usePullToRefresh({
    enabled: isAuthenticated,
    onRefresh: handleRefresh,
  })

  const showPullIndicator = isPulling || isRefreshing

  return (
    <div>
      {showPullIndicator ? (
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center pt-[env(safe-area-inset-top)] lg:pl-64"
          aria-live="polite"
          aria-busy={isRefreshing}
        >
          <div
            className="mt-2 flex items-center gap-2 rounded-full border-2 border-ocean-600 bg-ocean-900/95 px-4 py-2 text-sm font-medium text-spray shadow-lg"
            style={{
              transform: `translateY(${isRefreshing ? 0 : Math.min(pullDistance * 0.35, 28)}px)`,
              opacity: isRefreshing ? 1 : 0.4 + progress * 0.6,
            }}
          >
            <RefreshCw
              className={[
                'h-4 w-4',
                isRefreshing || progress >= 1 ? 'animate-spin text-action' : '',
              ].join(' ')}
              aria-hidden
            />
            {isRefreshing
              ? 'Refreshing…'
              : progress >= 1
                ? 'Release to refresh'
                : 'Pull to refresh'}
          </div>
        </div>
      ) : null}

      <PageHeader
        title="Log Book"
        subtitle={
          isAuthenticated
            ? `${catches.length} catch${catches.length === 1 ? '' : 'es'} · ${marks.length} mark${marks.length === 1 ? '' : 's'}`
            : 'Sign in to sync your catches and marks'
        }
        action={
          isAuthenticated ? (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-ocean-600 text-spray transition-colors hover:border-spray hover:text-foam disabled:opacity-50"
              aria-label="Refresh log book"
            >
              <RefreshCw
                className={['h-5 w-5', refreshing ? 'animate-spin' : ''].join(' ')}
              />
            </button>
          ) : null
        }
      />

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-6 sm:px-6">
        {!authLoading && !user ? (
          <div className="rounded-2xl border-2 border-ocean-600 bg-ocean-900 px-6 py-8 text-center">
            <Fish className="mx-auto h-12 w-12 text-ocean-500" aria-hidden />
            <p className="mt-4 text-xl font-bold text-foam">Your log stays on the boat</p>
            <p className="mt-2 text-base text-spray">
              Sign in to see catches and marks saved to your account.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-action px-8 text-lg font-bold text-action-text hover:bg-action-hover"
            >
              Sign in
            </Link>
          </div>
        ) : null}

        <section aria-labelledby="catches-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2
              id="catches-heading"
              className="flex items-center gap-2 text-xl font-bold text-foam"
            >
              <Fish className="h-6 w-6 text-action" aria-hidden />
              Recent Catches
            </h2>
            {isAuthenticated ? (
              <Link
                to="/new-catch"
                className="flex items-center gap-1.5 rounded-xl bg-catch/20 px-3 py-2 text-sm font-bold text-catch hover:bg-catch/30"
              >
                <PlusCircle className="h-4 w-4" aria-hidden />
                Add
              </Link>
            ) : null}
          </div>

          {catchesError ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl border-2 border-red-400/50 bg-red-950/40 px-4 py-3 text-foam"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
              {catchesError}
            </p>
          ) : null}

          {loading && catches.length === 0 ? (
            <SectionSkeleton rows={3} />
          ) : catches.length === 0 && isAuthenticated ? (
            <div className="rounded-2xl border-2 border-dashed border-ocean-600 bg-ocean-900/50 px-6 py-10 text-center">
              <p className="text-lg font-semibold text-foam">No catches yet</p>
              <p className="mt-2 text-spray">Log your first fish from the map or New Catch.</p>
              <Link
                to="/new-catch"
                className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-action px-5 font-bold text-action-text hover:bg-action-hover"
              >
                <PlusCircle className="h-5 w-5" aria-hidden />
                Log a catch
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {catches.map((entry) => (
                <CatchCard
                  key={entry.id}
                  entry={entry}
                  onDelete={deleteCatch}
                  deleting={deletingId === entry.id}
                />
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="marks-heading">
          <h2
            id="marks-heading"
            className="mb-4 flex items-center gap-2 text-xl font-bold text-foam"
          >
            <Anchor className="h-6 w-6 text-ocean-500" aria-hidden />
            Saved Marks
          </h2>

          {marksError ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl border-2 border-red-400/50 bg-red-950/40 px-4 py-3 text-foam"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
              {marksError}
            </p>
          ) : null}

          {loading && marks.length === 0 ? (
            <SectionSkeleton rows={2} />
          ) : marks.length === 0 && isAuthenticated ? (
            <div className="rounded-2xl border-2 border-dashed border-ocean-600 bg-ocean-900/50 px-6 py-10 text-center">
              <MapPin className="mx-auto h-10 w-10 text-ocean-500" aria-hidden />
              <p className="mt-3 text-lg font-semibold text-foam">No marks yet</p>
              <p className="mt-2 text-spray">
                Open the map and tap <strong className="text-foam">Drop Mark</strong>.
              </p>
              <Link
                to="/map"
                className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-ocean-500 px-5 font-bold text-foam hover:bg-ocean-800"
              >
                Go to map
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {marks.map((mark) => (
                <li
                  key={mark.id}
                  className="rounded-2xl border-2 border-ocean-700 bg-ocean-900 px-5 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-foam">{mark.name}</p>
                      <p className="mt-1 text-base text-spray">
                        {mark.description ?? 'No description'}
                      </p>
                      <p className="mt-2 font-mono text-xs text-spray/60">
                        {mark.latitude.toFixed(4)}, {mark.longitude.toFixed(4)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <Link
                        to={`/map?markId=${mark.id}`}
                        className="rounded-xl border-2 border-ocean-500 px-3 py-2 text-center text-sm font-bold text-foam hover:bg-ocean-800"
                      >
                        View on map
                      </Link>
                      <Link
                        to={`/new-catch?markId=${mark.id}`}
                        className="rounded-xl bg-catch px-3 py-2 text-center text-sm font-bold text-catch-text hover:bg-catch-hover"
                      >
                        Log catch
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {loading && (catches.length > 0 || marks.length > 0) ? (
          <p className="flex items-center justify-center gap-2 text-sm text-spray/70">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Updating…
          </p>
        ) : null}
      </div>
    </div>
  )
}
