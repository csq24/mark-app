import {
  Crosshair,
  Fish,
  Layers,
  Loader2,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Map, {
  Marker,
  NavigationControl,
  Popup,
  type MapMouseEvent,
  type MapRef,
} from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { FishingAtlasEntry } from '../../data/fishingAtlas'
import { useAuth } from '../../hooks/useAuth'
import { useCatches } from '../../hooks/useCatches'
import { useGeolocation } from '../../hooks/useGeolocation'
import { useMapLongPress } from '../../hooks/useMapLongPress'
import { useMarks } from '../../hooks/useMarks'
import {
  filterMarksByTime,
  type MarkTimeRange,
} from '../../lib/markTimeFilter'
import { useAquaticMapTheme } from '../../hooks/useAquaticMapTheme'
import { useDetailMapLabels } from '../../hooks/useDetailMapLabels'
import { useSeamarkOverlay } from '../../hooks/useSeamarkOverlay'
import { fitMapToMarks, flyToMark } from '../../lib/mapBounds'
import { isOwnMark } from '../../lib/markOwnership'
import { defaultQuickMarkName } from '../../lib/defaultMarkName'
import { findMarkAreaGuide } from '../../lib/markAreaGuide'
import { requestGeolocation } from '../../lib/requestGeolocation'
import { useEffectiveMapStyle } from '../../hooks/useEffectiveMapStyle'
import {
  mapStyleAttribution,
  resolveMapStyle,
  usesAquaticTheme,
  usesDetailMapLabels,
  usesSeamarkOverlay,
  type MapStylePreference,
} from '../../lib/mapStyles'
import type { MarkWithOwner } from '../../types/database'
import { AtlasInfoPopup } from './AtlasInfoPopup'
import { DraftMarkPin } from './DraftMarkPin'
import { DropMarkModal } from './DropMarkModal'
import { MarkQuickChoiceModal } from './MarkQuickChoiceModal'
import { FishingAtlasMarkers } from './FishingAtlasMarkers'
import { MapCrosshair } from './MapCrosshair'
import { MapMarksPanel } from './MapMarksPanel'
import { MapMarksTray } from './MapMarksTray'
import { MapStyleSelect } from './MapStyleSelect'
import { MapTimeFilter } from './MapTimeFilter'
import { MarkMarker } from './MarkMarker'
import { MarkDetailPanel } from './MarkDetailPanel'

const DEFAULT_VIEW = {
  longitude: -82.45,
  latitude: 27.95,
  zoom: 9,
}

type ViewState = {
  longitude: number
  latitude: number
  zoom: number
}

type Coords = { latitude: number; longitude: number }

export function FishingMap() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const focusMarkId = searchParams.get('markId')

  const mapRef = useRef<MapRef>(null)
  const hasSetInitialView = useRef(false)
  const hasFocusedUrlMark = useRef(false)

  const { user } = useAuth()
  const { position, error: geoError, loading: geoLoading } = useGeolocation()
  const {
    marks,
    loading: marksLoading,
    error: marksError,
    createMark,
    setMarkPhoto,
    refetch: refetchMarks,
    isAuthenticated,
  } = useMarks()

  const { catches, loading: catchesLoading } = useCatches()

  const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW)
  const [mapStylePreference, setMapStylePreference] =
    useState<MapStylePreference>('auto')
  const effectiveMapStyle = useEffectiveMapStyle(mapStylePreference, viewState.zoom)
  const [timeRange, setTimeRange] = useState<MarkTimeRange>('week')
  const [selectedMark, setSelectedMark] = useState<MarkWithOwner | null>(null)
  const [selectedAtlas, setSelectedAtlas] = useState<FishingAtlasEntry | null>(
    null,
  )
  const [dropModalOpen, setDropModalOpen] = useState(false)
  const [quickChoiceOpen, setQuickChoiceOpen] = useState(false)
  const [draftCoords, setDraftCoords] = useState<Coords | null>(null)
  const [saving, setSaving] = useState(false)
  const [markButtonBusy, setMarkButtonBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [locationHint, setLocationHint] = useState<string | null>(null)

  const visibleMarks = filterMarksByTime(marks, timeRange)

  useAquaticMapTheme(mapRef, usesAquaticTheme(effectiveMapStyle))
  useDetailMapLabels(mapRef, usesDetailMapLabels(effectiveMapStyle))
  useSeamarkOverlay(mapRef, usesSeamarkOverlay(effectiveMapStyle))

  const openDropAt = useCallback((coords: Coords) => {
    setDraftCoords(coords)
    setSaveError(null)
    setSelectedMark(null)
    setSelectedAtlas(null)
    setDropModalOpen(true)
  }, [])

  useMapLongPress(mapRef, {
    enabled: isAuthenticated && !dropModalOpen,
    onLongPress: (coords) => openDropAt(coords),
  })

  const centerOnUser = useCallback((latitude: number, longitude: number) => {
    const map = mapRef.current?.getMap()
    if (map) {
      map.flyTo({ center: [longitude, latitude], zoom: 13, duration: 1200 })
    } else {
      setViewState((prev) => ({
        ...prev,
        latitude,
        longitude,
        zoom: 13,
      }))
    }
  }, [])

  const fitAllMarks = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (!map || visibleMarks.length === 0) return
    fitMapToMarks(map, visibleMarks, { userPosition: position })
  }, [visibleMarks, position])

  const selectMark = useCallback((mark: MarkWithOwner) => {
    setSelectedMark(mark)
    setSelectedAtlas(null)
    const map = mapRef.current?.getMap()
    if (map) flyToMark(map, mark)
  }, [])

  const selectAtlas = useCallback((entry: FishingAtlasEntry) => {
    setSelectedAtlas(entry)
    setSelectedMark(null)
    const map = mapRef.current?.getMap()
    if (map) {
      const zoom =
        entry.kind === 'country' ? 5 : entry.kind === 'coast' ? 9.5 : 7.5
      map.flyTo({
        center: [entry.longitude, entry.latitude],
        zoom,
        duration: 1200,
      })
    }
  }, [])

  const clearMapSelection = useCallback(() => {
    setSelectedMark(null)
    setSelectedAtlas(null)
  }, [])

  const showAtlas = viewState.zoom < 11.5

  const applyInitialView = useCallback(() => {
    if (marksLoading || !isAuthenticated || hasSetInitialView.current) return

    const map = mapRef.current?.getMap()
    if (!map) return

    if (visibleMarks.length > 0) {
      hasSetInitialView.current = true
      fitMapToMarks(map, visibleMarks, { userPosition: position })
      return
    }

    if (position) {
      hasSetInitialView.current = true
      centerOnUser(position.latitude, position.longitude)
    }
  }, [visibleMarks, marksLoading, isAuthenticated, position, centerOnUser])

  useEffect(() => {
    applyInitialView()
  }, [applyInitialView])

  useEffect(() => {
    if (!focusMarkId || marksLoading || hasFocusedUrlMark.current) return
    const mark = marks.find((m) => m.id === focusMarkId)
    if (!mark) return
    hasFocusedUrlMark.current = true
    selectMark(mark)
  }, [focusMarkId, marks, marksLoading, selectMark])

  const saveMarkAtDraft = async (payload: {
    name: string
    description: string
    photoFile: File | null
  }) => {
    if (!draftCoords) return

    setSaving(true)
    setSaveError(null)

    try {
      const created = await createMark({
        name: payload.name,
        description: payload.description || null,
        latitude: draftCoords.latitude,
        longitude: draftCoords.longitude,
        photo_url: null,
      })

      let withOwner = { ...created, profiles: null } as MarkWithOwner

      if (payload.photoFile) {
        try {
          withOwner = await setMarkPhoto(created.id, payload.photoFile)
        } catch {
          setSaveError(
            'Mark saved, but the photo did not upload. Open the mark to add a photo.',
          )
        }
      }

      setDropModalOpen(false)
      setQuickChoiceOpen(false)
      setDraftCoords(null)
      selectMark(withOwner)
      void refetchMarks()
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Could not save this mark.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleMarkButton = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setMarkButtonBusy(true)
    setSaveError(null)
    setLocationHint(null)
    setSelectedMark(null)
    setSelectedAtlas(null)

    try {
      let coords: Coords | null = position
        ? {
            latitude: position.latitude,
            longitude: position.longitude,
          }
        : null

      if (!coords) {
        setLocationHint('Finding your location…')
        coords = await requestGeolocation()
      }

      centerOnUser(coords.latitude, coords.longitude)
      setDraftCoords(coords)
      setQuickChoiceOpen(true)
      setDropModalOpen(false)
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Could not get your location.',
      )
    } finally {
      setMarkButtonBusy(false)
      setLocationHint(null)
    }
  }

  const handleMarkOnly = () => {
    void saveMarkAtDraft({
      name: defaultQuickMarkName(),
      description: '',
      photoFile: null,
    })
  }

  const handleAddMarkDetails = () => {
    setQuickChoiceOpen(false)
    setSaveError(null)
    setDropModalOpen(true)
  }

  const closeQuickChoice = () => {
    if (saving) return
    setQuickChoiceOpen(false)
    setDraftCoords(null)
    setSaveError(null)
  }

  const handleMapContextMenu = (event: MapMouseEvent) => {
    if (!isAuthenticated) return
    event.preventDefault()
    openDropAt({ latitude: event.lngLat.lat, longitude: event.lngLat.lng })
  }

  const closeDropModal = () => {
    if (saving) return
    setDropModalOpen(false)
    if (!quickChoiceOpen) setDraftCoords(null)
    setSaveError(null)
  }

  const markAreaGuide = useMemo(
    () =>
      selectedMark
        ? findMarkAreaGuide(selectedMark.latitude, selectedMark.longitude)
        : null,
    [selectedMark],
  )

  const mapFlowOpen = dropModalOpen || quickChoiceOpen
  const showCrosshair =
    isAuthenticated && !mapFlowOpen && !selectedMark && !markButtonBusy
  const showDraftPin =
    draftCoords && (mapFlowOpen || saving || markButtonBusy)

  return (
    <div className="flex h-full min-h-0 w-full">
      <MapMarksPanel
        marks={visibleMarks}
        currentUserId={user?.id}
        selectedMarkId={selectedMark?.id ?? null}
        onSelect={selectMark}
        loading={marksLoading && isAuthenticated}
      />

      <div className="relative min-h-0 min-w-0 flex-1">
      <Map
        key={effectiveMapStyle}
        ref={mapRef}
        mapStyle={resolveMapStyle(effectiveMapStyle)}
        {...viewState}
        onMove={(event) =>
          setViewState({
            longitude: event.viewState.longitude,
            latitude: event.viewState.latitude,
            zoom: event.viewState.zoom,
          })
        }
        onClick={clearMapSelection}
        onContextMenu={handleMapContextMenu}
        onLoad={applyInitialView}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <NavigationControl position="top-right" showCompass />

        {showAtlas ? (
          <FishingAtlasMarkers
            zoom={viewState.zoom}
            selectedId={selectedAtlas?.id ?? null}
            onSelect={selectAtlas}
          />
        ) : null}

        {visibleMarks.map((mark) => (
          <MarkMarker
            key={mark.id}
            mark={mark}
            isOwn={isOwnMark(mark, user?.id)}
            selected={selectedMark?.id === mark.id}
            onSelect={selectMark}
          />
        ))}

        {showDraftPin ? (
          <DraftMarkPin
            latitude={draftCoords.latitude}
            longitude={draftCoords.longitude}
          />
        ) : null}

        {position ? (
          <Marker
            longitude={position.longitude}
            latitude={position.latitude}
            anchor="center"
          >
            <span
              className="relative flex h-5 w-5 items-center justify-center"
              aria-label="Your location"
            >
              <span className="absolute h-8 w-8 animate-ping rounded-full bg-sky-400/40" />
              <span className="h-4 w-4 rounded-full border-2 border-white bg-sky-500 shadow-md" />
            </span>
          </Marker>
        ) : null}

        {selectedAtlas ? (
          <Popup
            longitude={selectedAtlas.longitude}
            latitude={selectedAtlas.latitude}
            anchor="bottom"
            offset={[0, selectedAtlas.kind === 'country' ? -48 : -44] as [
              number,
              number,
            ]}
            closeOnClick={false}
            onClose={() => setSelectedAtlas(null)}
            className="mark-popup"
          >
            <AtlasInfoPopup
              entry={selectedAtlas}
              onClose={() => setSelectedAtlas(null)}
            />
          </Popup>
        ) : null}
      </Map>

      {showCrosshair ? <MapCrosshair /> : null}

      {!selectedMark ? (
        <MapMarksTray
          marks={visibleMarks}
          currentUserId={user?.id}
          selectedMarkId={null}
          onSelect={selectMark}
        />
      ) : null}

      {selectedMark && markAreaGuide ? (
        <MarkDetailPanel
          mark={selectedMark}
          isOwn={isOwnMark(selectedMark, user?.id)}
          catches={catches}
          catchesLoading={catchesLoading}
          areaGuide={markAreaGuide}
          savingMark={saving}
          onPhotoChange={async (file) => {
            const updated = await setMarkPhoto(selectedMark.id, file)
            setSelectedMark(updated)
          }}
          onClose={() => setSelectedMark(null)}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex flex-col items-center gap-2 px-3">
        <MapTimeFilter value={timeRange} onChange={setTimeRange} />

        {geoLoading || markButtonBusy ? (
          <StatusBanner icon={<Loader2 className="h-4 w-4 animate-spin" />}>
            {locationHint ?? 'Acquiring GPS…'}
          </StatusBanner>
        ) : null}
        {geoError ? (
          <StatusBanner variant="warn">{geoError}</StatusBanner>
        ) : null}
        {!isAuthenticated ? (
          <StatusBanner variant="warn">
            Sign in to load and save your marks.
          </StatusBanner>
        ) : isAuthenticated && marks.length === 0 && viewState.zoom >= 9 ? (
          <StatusBanner variant="info">
            Press &amp; hold the map to drop a Mark · right-click on desktop
          </StatusBanner>
        ) : showAtlas && !selectedAtlas && viewState.zoom < 9 ? (
          <StatusBanner variant="info">
            Zoom in to drop marks · map switches to cities &amp; lakes automatically
          </StatusBanner>
        ) : null}
        {marksError ? (
          <StatusBanner variant="error">{marksError}</StatusBanner>
        ) : null}
        {marksLoading && isAuthenticated ? (
          <StatusBanner icon={<Loader2 className="h-4 w-4 animate-spin" />}>
            Loading marks…
          </StatusBanner>
        ) : null}
      </div>

      <div className="pointer-events-none absolute right-3 top-14 z-10">
        <MapStyleSelect
          value={mapStylePreference}
          onChange={setMapStylePreference}
        />
      </div>

      <p className="pointer-events-none absolute bottom-2 left-2 z-10 max-w-[14rem] text-[10px] leading-tight text-spray/80">
        {mapStyleAttribution(effectiveMapStyle)}
      </p>

      <div className="pointer-events-none absolute right-3 top-28 z-10 flex flex-col gap-2">
        {visibleMarks.length > 0 ? (
          <button
            type="button"
            onClick={fitAllMarks}
            className="pointer-events-auto flex h-12 items-center justify-center gap-2 rounded-full border border-mark-700 bg-mark-950/95 px-3 text-sm font-bold text-foam shadow-lg backdrop-blur-md hover:bg-mark-800"
            aria-label={`Show all ${visibleMarks.length} marks`}
          >
            <Layers className="h-5 w-5 shrink-0" aria-hidden />
            <span className="hidden sm:inline">All marks</span>
            <span className="rounded-md bg-mark-800 px-1.5 py-0.5 text-xs">
              {visibleMarks.length}
            </span>
          </button>
        ) : null}

        {position ? (
          <button
            type="button"
            onClick={() => centerOnUser(position.latitude, position.longitude)}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-mark-700 bg-mark-950/95 text-foam shadow-lg backdrop-blur-md hover:bg-mark-800"
            aria-label="Center on my location"
          >
            <Crosshair className="h-6 w-6" />
          </button>
        ) : null}
      </div>

      {!selectedMark && !mapFlowOpen ? (
        <button
          type="button"
          onClick={() => void handleMarkButton()}
          disabled={markButtonBusy}
          aria-label={
            isAuthenticated
              ? 'Drop a mark at your location'
              : 'Sign in to drop marks'
          }
          className={[
            'absolute left-1/2 z-[60] flex min-h-14 -translate-x-1/2 flex-col items-center justify-center gap-0.5 rounded-full px-10 py-3 text-lg font-bold shadow-xl transition-transform active:scale-[0.98] disabled:cursor-wait disabled:opacity-70',
            'bottom-[calc(5.5rem+env(safe-area-inset-bottom))]',
            isAuthenticated
              ? 'bg-mark-blue text-mark-950 shadow-mark-blue/30 hover:bg-mark-blue-hover'
              : 'border-2 border-mark-blue bg-mark-950/95 text-mark-blue backdrop-blur-md hover:bg-mark-800',
          ].join(' ')}
        >
          {markButtonBusy ? (
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          ) : (
            <Fish className="h-6 w-6" strokeWidth={2.5} aria-hidden />
          )}
          <span>{isAuthenticated ? 'Mark' : 'Sign in to Mark'}</span>
        </button>
      ) : null}

      <MarkQuickChoiceModal
        open={quickChoiceOpen}
        latitude={draftCoords?.latitude ?? viewState.latitude}
        longitude={draftCoords?.longitude ?? viewState.longitude}
        saving={saving}
        error={saveError}
        onMarkOnly={handleMarkOnly}
        onAddDetails={handleAddMarkDetails}
        onClose={closeQuickChoice}
      />

      <DropMarkModal
        open={dropModalOpen}
        latitude={draftCoords?.latitude ?? viewState.latitude}
        longitude={draftCoords?.longitude ?? viewState.longitude}
        title="New Mark"
        saving={saving}
        error={saveError}
        onClose={closeDropModal}
        onSave={(payload) => void saveMarkAtDraft(payload)}
      />
      </div>
    </div>
  )
}

function StatusBanner({
  children,
  icon,
  variant = 'info',
}: {
  children: React.ReactNode
  icon?: React.ReactNode
  variant?: 'info' | 'warn' | 'error'
}) {
  const styles = {
    info: 'border-mark-700 bg-mark-950/95 text-spray',
    warn: 'border-mark-blue/40 bg-mark-950/95 text-mark-blue',
    error: 'border-red-500/40 bg-red-950/90 text-red-100',
  }

  return (
    <p
      className={`pointer-events-auto flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-md ${styles[variant]}`}
    >
      {icon}
      {children}
    </p>
  )
}
