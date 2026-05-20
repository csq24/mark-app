import { PageHeader } from '../components/layout/PageHeader'
import { NewCatchForm } from '../components/catch/NewCatchForm'

export function NewCatchPage() {
  return (
    <div>
      <PageHeader
        title="New Catch"
        subtitle="Log what you caught right now"
      />
      <NewCatchForm />
    </div>
  )
}
