import { ShoppingBag } from 'lucide-react'
import { FeaturePage } from './FeaturePage'

export function MarketplacePage() {
  return (
    <FeaturePage
      title="Marketplace"
      subtitle="Buy and sell tackle, parts, and boat gear"
      icon={ShoppingBag}
    >
      <p className="mt-4 text-lg text-foam">
        Listings for engines, tackle, electronics, and repair services — coming
        soon.
      </p>
      <p className="mt-3 text-sm text-spray">
        Meet in safe public places for local sales. Report suspicious listings.
      </p>
    </FeaturePage>
  )
}
