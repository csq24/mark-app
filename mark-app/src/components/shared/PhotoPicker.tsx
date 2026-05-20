import { Camera, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type PhotoPickerProps = {
  label?: string
  disabled?: boolean
  previewUrl: string | null
  onPreviewChange: (preview: string | null, file: File | null) => void
}

export function PhotoPicker({
  label = 'Photo (optional)',
  disabled = false,
  previewUrl,
  onPreviewChange,
}: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(previewUrl)

  useEffect(() => {
    setLocalPreview(previewUrl)
  }, [previewUrl])

  useEffect(() => {
    return () => {
      if (localPreview && localPreview.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview)
      }
    }
  }, [localPreview])

  function handleFileChange(file: File | null) {
    if (localPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(localPreview)
    }
    if (!file) {
      setLocalPreview(null)
      onPreviewChange(null, null)
      return
    }
    const url = URL.createObjectURL(file)
    setLocalPreview(url)
    onPreviewChange(url, file)
  }

  function clearPhoto() {
    if (inputRef.current) inputRef.current.value = ''
    handleFileChange(null)
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-semibold text-foam">{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null
          handleFileChange(file)
        }}
        aria-label="Upload spot photo"
      />
      {localPreview ? (
        <div className="relative overflow-hidden rounded-xl border-2 border-ocean-600">
          <img
            src={localPreview}
            alt="Spot preview"
            className="max-h-48 w-full object-cover"
          />
          <button
            type="button"
            onClick={clearPhoto}
            disabled={disabled}
            className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-ocean-950/90 text-foam hover:bg-ocean-800 disabled:opacity-50"
            aria-label="Remove photo"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ocean-500 bg-ocean-800/60 px-4 text-base font-semibold text-foam transition-colors hover:border-spray hover:bg-ocean-800 disabled:opacity-50"
        >
          <Camera className="h-6 w-6 text-action" aria-hidden />
          Add spot photo
        </button>
      )}
    </div>
  )
}
