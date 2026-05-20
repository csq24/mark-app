import { Loader2, X } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import {
  LISTING_CATEGORIES,
  MARKETPLACE_CONDITIONS,
} from '../../data/marketplaceCategories'
import type { MarketplaceCategory, MarketplaceCondition } from '../../types/database'

type CreateListingModalProps = {
  open: boolean
  saving: boolean
  error: string | null
  onClose: () => void
  onSubmit: (input: {
    category: MarketplaceCategory
    title: string
    description: string
    priceCents: number
    condition: MarketplaceCondition
  }) => void | Promise<void>
}

export function CreateListingModal({
  open,
  saving,
  error,
  onClose,
  onSubmit,
}: CreateListingModalProps) {
  if (!open) return null

  return (
    <CreateListingForm
      key="open"
      saving={saving}
      error={error}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}

function CreateListingForm({
  saving,
  error,
  onClose,
  onSubmit,
}: Omit<CreateListingModalProps, 'open'>) {
  const titleId = useId()
  const [category, setCategory] = useState<MarketplaceCategory>('tackle')
  const [condition, setCondition] = useState<MarketplaceCondition>('good')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim() || !description.trim() || saving) return

    const parsed = parsePriceToCents(price)
    if (parsed === null) return

    await onSubmit({
      category,
      title: title.trim(),
      description: description.trim(),
      priceCents: parsed,
      condition,
    })
  }

  const priceCents = parsePriceToCents(price)
  const priceInvalid = price.trim() !== '' && priceCents === null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ocean-950/80 p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:items-center sm:pb-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl border-2 border-ocean-600 bg-ocean-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg text-spray hover:bg-ocean-800 disabled:opacity-50"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 id={titleId} className="pr-10 text-xl font-bold text-foam">
          List an item
        </h2>
        <p className="mt-1 text-sm text-spray">
          Buyers can message you about shipping, pickup, and payment.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-foam">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MarketplaceCategory)}
              disabled={saving}
              className={inputClass}
            >
              {LISTING_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-foam">Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Shimano 4000XG spinning reel"
              disabled={saving}
              required
              minLength={3}
              className={inputClass}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-foam">Price (USD)</span>
              <input
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0 for free"
                disabled={saving}
                required
                className={inputClass}
              />
              {priceInvalid ? (
                <p className="mt-1 text-xs text-red-300">Enter a valid price</p>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-foam">Condition</span>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as MarketplaceCondition)}
                disabled={saving}
                className={inputClass}
              >
                {MARKETPLACE_CONDITIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-foam">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Size, brand, what's included. Mention if you can ship or prefer local pickup."
              disabled={saving}
              required
              rows={5}
              className={[inputClass, 'resize-y min-h-28'].join(' ')}
            />
          </label>

          {error ? (
            <p role="alert" className="text-sm font-medium text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={
              saving ||
              title.trim().length < 3 ||
              !description.trim() ||
              priceCents === null
            }
            className="flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-action font-bold text-action-text hover:bg-action-hover disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Publishing…
              </>
            ) : (
              'Publish listing'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

function parsePriceToCents(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const value = Number.parseFloat(trimmed.replace(/[$,]/g, ''))
  if (!Number.isFinite(value) || value < 0) return null
  return Math.round(value * 100)
}

const inputClass =
  'w-full min-h-12 rounded-xl border-2 border-ocean-600 bg-ocean-800 px-4 text-base text-foam placeholder:text-spray/50 focus:border-mark-blue focus:outline-none disabled:opacity-50'
