import { PageHeader } from '../components/layout/PageHeader'
import { ProfileSettingsForm } from '../components/settings/ProfileSettingsForm'

export function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Name, boat, friends list, and spot sharing"
      />
      <ProfileSettingsForm />
    </div>
  )
}
