import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Loader2,
  MapPin,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useMarks } from '../../hooks/useMarks'
import { uploadCatchPhoto } from '../../lib/catchPhotos'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'

const QUICK_FISH = ['Grouper', 'Snapper', 'Mahi', 'Lobster'] as const
const OTHER_FISH = 'Other'
const REDIRECT_DELAY_MS = 1400

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

type FormFields = {
  fishChoice: string | null
  otherFish: string
  weightLbs: string
  depthFt: string
  markId: string
  photoFile: File | null
  photoPreview: string | null
}

const INITIAL_FIELDS: FormFields = {
  fishChoice: null,
  otherFish: '',
  weightLbs: '',
  depthFt: '',
  markId: '',
  photoFile: null,
  photoPreview: null,
}

function parseOptionalPositiveNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const num = Number(trimmed)
  if (!Number.isFinite(num) || num < 0) return null
  return num
}

function resolveFishType(fishChoice: string | null, otherFish: string): string | null {
  if (!fishChoice) return null
  if (fishChoice === OTHER_FISH) {
    const trimmed = otherFish.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  return fishChoice
}

export function NewCatchForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const { marks, loading: marksLoading } = useMarks()

  const formId = useId()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prefillMarkId = searchParams.get('markId')
  const prefillFish = searchParams.get('fish')

  const [fields, setFields] = useState<FormFields>(() => {
    if (!prefillFish) return INITIAL_FIELDS
    const trimmed = prefillFish.trim()
    if (!trimmed) return INITIAL_FIELDS
    const quickMatch = QUICK_FISH.find(
      (fish) => fish.toLowerCase() === trimmed.toLowerCase(),
    )
    if (quickMatch) {
      return { ...INITIAL_FIELDS, fishChoice: quickMatch }
    }
    return {
      ...INITIAL_FIELDS,
      fishChoice: OTHER_FISH,
      otherFish: trimmed,
    }
  })
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isLoading = status === 'loading'
  const isSuccess = status === 'success'
  const isDisabled = isLoading || isSuccess || authLoading || !user

  const resetForm = useCallback(() => {
    setFields((prev) => {
      if (prev.photoPreview) {
        URL.revokeObjectURL(prev.photoPreview)
      }
      return { ...INITIAL_FIELDS, markId: '' }
    })
    if (photoInputRef.current) {
      photoInputRef.current.value = ''
    }
  }, [])

  const linkedMarkId =
    prefillMarkId && !marksLoading && marks.some((mark) => mark.id === prefillMarkId)
      ? prefillMarkId
      : fields.markId

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (fields.photoPreview) {
        URL.revokeObjectURL(fields.photoPreview)
      }
    }
  }, [fields.photoPreview])

  function updateField<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (status === 'error') {
      setStatus('idle')
      setErrorMessage(null)
    }
  }

  function handleFishSelect(fish: string) {
    updateField('fishChoice', fish)
    if (fish !== OTHER_FISH) {
      updateField('otherFish', '')
    }
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setStatus('error')
      setErrorMessage('Please choose a photo of your catch.')
      return
    }

    setFields((prev) => {
      if (prev.photoPreview) {
        URL.revokeObjectURL(prev.photoPreview)
      }
      return {
        ...prev,
        photoFile: file,
        photoPreview: URL.createObjectURL(file),
      }
    })
    if (status === 'error') {
      setStatus('idle')
      setErrorMessage(null)
    }
  }

  function clearPhoto() {
    setFields((prev) => {
      if (prev.photoPreview) {
        URL.revokeObjectURL(prev.photoPreview)
      }
      return { ...prev, photoFile: null, photoPreview: null }
    })
    if (photoInputRef.current) {
      photoInputRef.current.value = ''
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isSupabaseConfigured) {
      setStatus('error')
      setErrorMessage(
        'App is not connected to Supabase yet. Add your keys to a .env file.',
      )
      return
    }

    if (!user) {
      setStatus('error')
      setErrorMessage('Sign in first to save a catch to your log book.')
      return
    }

    const fishType = resolveFishType(fields.fishChoice, fields.otherFish)
    if (!fishType) {
      setStatus('error')
      setErrorMessage('Pick a fish type, or type one under Other.')
      return
    }

    const weightLbs = parseOptionalPositiveNumber(fields.weightLbs)
    const depthFt = parseOptionalPositiveNumber(fields.depthFt)

    if (fields.weightLbs.trim() && weightLbs === null) {
      setStatus('error')
      setErrorMessage('Weight must be a valid number in pounds.')
      return
    }

    if (fields.depthFt.trim() && depthFt === null) {
      setStatus('error')
      setErrorMessage('Depth must be a valid number in feet.')
      return
    }

    setStatus('loading')
    setErrorMessage(null)

    try {
      const { data: inserted, error: insertError } = await supabase
        .from('catches')
        .insert({
          user_id: user.id,
          mark_id: linkedMarkId || null,
          fish_type: fishType,
          weight_lbs: weightLbs,
          water_depth_ft: depthFt,
          photo_url: null,
        })
        .select('id')
        .single()

      if (insertError || !inserted) {
        throw new Error(insertError?.message ?? 'Could not save your catch.')
      }

      if (fields.photoFile) {
        const photoUrl = await uploadCatchPhoto(
          inserted.id,
          user.id,
          fields.photoFile,
        )

        const { error: photoUpdateError } = await supabase
          .from('catches')
          .update({ photo_url: photoUrl })
          .eq('id', inserted.id)

        if (photoUpdateError) {
          throw new Error(
            'Catch saved, but the photo did not upload. You can add it later.',
          )
        }
      }

      setStatus('success')
      resetForm()

      redirectTimerRef.current = setTimeout(() => {
        navigate('/logbook', { replace: true })
      }, REDIRECT_DELAY_MS)
    } catch (err) {
      setStatus('error')
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Check your connection and try again.',
      )
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <StatusBanner
        variant="error"
        message="Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a .env file to enable saving catches."
      />
    )
  }

  return (
    <form
      id={formId}
      onSubmit={(e) => void handleSubmit(e)}
      className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-6 pb-32 sm:px-6 lg:pb-12"
      noValidate
    >
      {!authLoading && !user ? (
        <div className="rounded-2xl border-2 border-catch/40 bg-ocean-900 px-5 py-5 text-center">
          <p className="text-lg text-foam">
            Sign in to save catches to your log book.
          </p>
          <Link
            to="/login"
            className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-action px-6 text-lg font-bold text-action-text hover:bg-action-hover"
          >
            Sign In
          </Link>
        </div>
      ) : null}

      {status === 'success' ? (
        <StatusBanner
          variant="success"
          message="Catch saved! Heading to your Log Book…"
          icon={<CheckCircle2 className="h-7 w-7 shrink-0" aria-hidden />}
        />
      ) : null}

      {status === 'error' && errorMessage ? (
        <StatusBanner
          variant="error"
          message={errorMessage}
          icon={<AlertCircle className="h-7 w-7 shrink-0" aria-hidden />}
        />
      ) : null}

      <fieldset disabled={isDisabled}>
        <legend className="mb-3 text-xl font-bold text-foam">
          What did you catch?
        </legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {QUICK_FISH.map((fish) => (
            <FishButton
              key={fish}
              label={fish}
              selected={fields.fishChoice === fish}
              onClick={() => handleFishSelect(fish)}
            />
          ))}
          <FishButton
            label={OTHER_FISH}
            selected={fields.fishChoice === OTHER_FISH}
            onClick={() => handleFishSelect(OTHER_FISH)}
          />
        </div>

        {fields.fishChoice === OTHER_FISH ? (
          <label className="mt-4 block">
            <span className="mb-2 block text-lg font-semibold text-spray">
              Fish name
            </span>
            <input
              type="text"
              value={fields.otherFish}
              onChange={(e) => updateField('otherFish', e.target.value)}
              placeholder="e.g. Wahoo"
              autoComplete="off"
              className={inputClassName}
            />
          </label>
        ) : null}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xl font-bold text-foam">
            Weight (lbs)
          </span>
          <input
            type="text"
            inputMode="decimal"
            enterKeyHint="next"
            value={fields.weightLbs}
            onChange={(e) => updateField('weightLbs', e.target.value)}
            placeholder="Optional"
            disabled={isDisabled}
            className={inputClassName}
            aria-describedby={`${formId}-weight-hint`}
          />
          <span
            id={`${formId}-weight-hint`}
            className="mt-1 block text-sm text-spray/80"
          >
            Leave blank if unknown
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-xl font-bold text-foam">
            Depth (ft)
          </span>
          <input
            type="text"
            inputMode="decimal"
            enterKeyHint="next"
            value={fields.depthFt}
            onChange={(e) => updateField('depthFt', e.target.value)}
            placeholder="Optional"
            disabled={isDisabled}
            className={inputClassName}
            aria-describedby={`${formId}-depth-hint`}
          />
          <span
            id={`${formId}-depth-hint`}
            className="mt-1 block text-sm text-spray/80"
          >
            Water depth where caught
          </span>
        </label>
      </div>

      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-xl font-bold text-foam">
          <MapPin className="h-6 w-6 text-ocean-500" aria-hidden />
          Link to a mark (optional)
        </span>
        <select
          value={linkedMarkId}
          onChange={(e) => updateField('markId', e.target.value)}
          disabled={isDisabled || marksLoading}
          className={[
            inputClassName,
            'appearance-none bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-12',
            'bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2724%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23e0f2fe%27 stroke-width=%272%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E")]',
          ].join(' ')}
        >
          <option value="">No mark — just log the catch</option>
          {marks.map((mark) => (
            <option key={mark.id} value={mark.id}>
              {mark.name}
            </option>
          ))}
        </select>
        {marksLoading ? (
          <p className="mt-2 text-sm text-spray/70">Loading your marks…</p>
        ) : marks.length === 0 ? (
          <p className="mt-2 text-sm text-spray/70">
            No saved Marks yet. Drop a Mark on the map first.
          </p>
        ) : null}
      </label>

      <div>
        <span className="mb-3 block text-xl font-bold text-foam">
          Photo (optional)
        </span>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          disabled={isDisabled}
          onChange={handlePhotoChange}
          aria-label="Upload catch photo"
        />

        {fields.photoPreview ? (
          <div className="relative overflow-hidden rounded-2xl border-2 border-ocean-600">
            <img
              src={fields.photoPreview}
              alt="Preview of your catch"
              className="max-h-64 w-full object-cover"
            />
            <button
              type="button"
              onClick={clearPhoto}
              disabled={isDisabled}
              className="absolute right-3 top-3 flex h-12 w-12 items-center justify-center rounded-full bg-ocean-950/90 text-foam focus-visible:outline focus-visible:outline-3 focus-visible:outline-spray"
              aria-label="Remove photo"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            disabled={isDisabled}
            className="flex w-full min-h-16 items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-ocean-500 bg-ocean-800/60 px-6 text-lg font-semibold text-foam transition-colors hover:border-spray hover:bg-ocean-800 focus-visible:outline focus-visible:outline-3 focus-visible:outline-spray disabled:opacity-50"
          >
            <Camera className="h-7 w-7 text-catch" aria-hidden />
            Snap or choose photo
          </button>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 border-t-2 border-ocean-700 bg-ocean-950/95 px-4 py-3 backdrop-blur-sm lg:static lg:bottom-auto lg:z-auto lg:border-t-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
        <button
          type="submit"
          disabled={isDisabled}
          className="flex w-full min-h-[4.25rem] items-center justify-center gap-3 rounded-2xl bg-action px-6 text-xl font-extrabold uppercase tracking-wide text-action-text shadow-lg shadow-black/30 transition-colors hover:bg-action-hover focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-catch disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-7 w-7 animate-spin" aria-hidden />
              Saving…
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="h-7 w-7" aria-hidden />
              Saved!
            </>
          ) : (
            'Save catch to log'
          )}
        </button>
      </div>
    </form>
  )
}

const inputClassName =
  'w-full min-h-14 rounded-xl border-2 border-ocean-600 bg-ocean-800 px-4 text-xl text-foam placeholder:text-spray/50 focus:border-spray focus:outline-none focus:ring-2 focus:ring-spray/30 disabled:opacity-50'

type FishButtonProps = {
  label: string
  selected: boolean
  onClick: () => void
}

function FishButton({ label, selected, onClick }: FishButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'min-h-16 rounded-2xl border-2 px-3 text-lg font-bold transition-colors',
        'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-catch',
        selected
          ? 'border-catch bg-catch text-catch-text shadow-md'
          : 'border-ocean-600 bg-ocean-800 text-foam hover:border-ocean-500 hover:bg-ocean-700',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

type StatusBannerProps = {
  variant: 'success' | 'error'
  message: string
  icon?: React.ReactNode
}

function StatusBanner({ variant, message, icon }: StatusBannerProps) {
  const isSuccess = variant === 'success'
  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      className={[
        'flex items-start gap-3 rounded-2xl border-2 px-4 py-4 text-lg font-medium',
        isSuccess
          ? 'border-action bg-action/15 text-foam'
          : 'border-red-400/60 bg-red-950/40 text-foam',
      ].join(' ')}
    >
      {icon ?? (
        <AlertCircle
          className={[
            'h-7 w-7 shrink-0',
            isSuccess ? 'text-action' : 'text-red-300',
          ].join(' ')}
          aria-hidden
        />
      )}
      <p>{message}</p>
    </div>
  )
}
