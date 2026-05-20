import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="border-b-2 border-ocean-700 bg-ocean-900 px-4 py-5 sm:px-6">
      <div className="mx-auto flex max-w-4xl items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foam sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-base text-spray sm:text-lg">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  )
}
