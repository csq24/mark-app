import type { LucideIcon } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'

type FeaturePageProps = {
  title: string
  subtitle: string
  icon: LucideIcon
  children?: React.ReactNode
}

export function FeaturePage({
  title,
  subtitle,
  icon: Icon,
  children,
}: FeaturePageProps) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-mark-700 bg-mark-900 p-8 text-center">
          <Icon className="mx-auto h-14 w-14 text-mark-blue" aria-hidden />
          {children}
        </div>
      </div>
    </div>
  )
}
