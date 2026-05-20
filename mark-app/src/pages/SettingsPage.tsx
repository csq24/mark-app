import { PageHeader } from '../components/layout/PageHeader'
import { ProfileSettingsForm } from '../components/settings/ProfileSettingsForm'

export function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Name, boat, and whether to share your spots"
      />
      <ProfileSettingsForm />
    </div>
  )
}
