import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { PhotoPicker } from '../shared/PhotoPicker'
import type { MarkWithOwner } from '../../types/database'

type MarkSpotPhotoProps = {
  mark: MarkWithOwner
  editable: boolean
  saving?: boolean
  onPhotoChange: (file: File | null) => Promise<void>
}

export function MarkSpotPhoto({
  mark,
  editable,
  saving = false,
  onPhotoChange,
}: MarkSpotPhotoProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function runPhotoUpdate(file: File | null) {
    setError(null)
    setUploading(true)
    try {
      await onPhotoChange(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update photo.')
    } finally {
      setUploading(false)
    }
  }

  if (!editable && !mark.photo_url) {
    return null
  }

  return (
    <div className="border-b border-mark-700 px-4 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-spray/70">
        Spot photo
      </p>

      {mark.photo_url ? (
        <div className="mb-3">
          <img
            src={mark.photo_url}
            alt={`Photo of ${mark.name}`}
            className="max-h-52 w-full rounded-xl object-cover"
          />
          {editable ? (
            <button
              type="button"
              disabled={saving || uploading}
              onClick={() => void runPhotoUpdate(null)}
              className="mt-2 text-sm font-semibold text-red-300 hover:text-red-200 disabled:opacity-50"
            >
              Remove photo
            </button>
          ) : null}
        </div>
      ) : null}

      {uploading ? (
        <p className="mb-2 flex items-center gap-2 text-sm text-spray">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Uploading photo…
        </p>
      ) : null}

      {editable && !mark.photo_url ? (
        <PhotoPicker
          label="Add spot photo"
          disabled={saving || uploading}
          previewUrl={null}
          onPreviewChange={(_preview, file) => {
            if (file) void runPhotoUpdate(file)
          }}
        />
      ) : null}

      {editable && mark.photo_url ? (
        <PhotoPicker
          label="Replace photo"
          disabled={saving || uploading}
          previewUrl={null}
          onPreviewChange={(_preview, file) => {
            if (file) void runPhotoUpdate(file)
          }}
        />
      ) : null}

      {error ? (
        <p className="mt-2 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
