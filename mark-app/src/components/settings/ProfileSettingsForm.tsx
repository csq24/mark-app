import { AlertCircle, CheckCircle2, Loader2, Ship, User } from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { isSupabaseConfigured } from '../../lib/supabase'
import { DemoBotsPanel } from './DemoBotsPanel'
import { FriendsList } from './FriendsList'
import { ShareSpotsSetting } from './ShareSpotsSetting'
import { ShowFriendSpotsSetting } from './ShowFriendSpotsSetting'

const inputClassName =
  'w-full min-h-14 rounded-xl border-2 border-ocean-600 bg-ocean-800 px-4 text-xl text-foam placeholder:text-spray/50 focus:border-spray focus:outline-none focus:ring-2 focus:ring-spray/30 disabled:opacity-50'

export function ProfileSettingsForm() {
  const { user, loading: authLoading } = useAuth()
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    saving,
    updateProfile,
    isAuthenticated,
  } = useProfile()

  const [fullName, setFullName] = useState('')
  const [boatName, setBoatName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return
    setFullName(profile.full_name ?? '')
    setBoatName(profile.boat_name ?? '')
  }, [profile])

  const loading = authLoading || profileLoading

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    try {
      await updateProfile({
        full_name: fullName,
        boat_name: boatName,
      })
      setSuccessMessage('Profile saved.')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save profile.')
    }
  }

  if (!authLoading && !user) {
    return (
      <SignInCard
        icon={<User className="mx-auto h-12 w-12 text-ocean-500" aria-hidden />}
        title="Sign in to edit your profile"
        body="Your name and boat name sync to your captain profile."
      />
    )
  }

  if (!isSupabaseConfigured) {
    return (
      <p className="mx-auto max-w-lg rounded-2xl border-2 border-red-400/50 bg-red-950/40 px-4 py-4 text-lg text-foam sm:px-6">
        Add Supabase keys to <code className="text-action">.env</code> first. See{' '}
        <code className="text-action">.env.example</code>.
      </p>
    )
  }

  if (loading) {
    return <ProfileLoadingState />
  }

  const displayError = formError ?? profileError

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="mx-auto max-w-lg space-y-6 px-4 py-6 sm:px-6"
    >
      {user?.email ? (
        <p className="text-base text-spray">
          Signed in as{' '}
          <span className="font-medium text-foam">{user.email}</span>
        </p>
      ) : null}

      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-lg font-semibold text-foam">
          <User className="h-5 w-5 text-action" aria-hidden />
          Your name
        </span>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Captain name"
          autoComplete="name"
          disabled={!isAuthenticated || saving}
          className={inputClassName}
        />
      </label>

      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-lg font-semibold text-foam">
          <Ship className="h-5 w-5 text-ocean-400" aria-hidden />
          Boat name
        </span>
        <input
          type="text"
          value={boatName}
          onChange={(e) => setBoatName(e.target.value)}
          placeholder="e.g. Sea Breeze"
          autoComplete="organization"
          disabled={!isAuthenticated || saving}
          className={inputClassName}
        />
      </label>

      <ShareSpotsSetting
        enabled={profile?.share_spots ?? false}
        disabled={!isAuthenticated}
        saving={saving}
        onChange={async (share_spots) => {
          await updateProfile({ share_spots })
          setSuccessMessage(
            share_spots
              ? 'Spot sharing is on for friends.'
              : 'Spot sharing is off.',
          )
          setFormError(null)
        }}
      />

      <ShowFriendSpotsSetting
        enabled={profile?.show_friend_spots ?? true}
        disabled={!isAuthenticated}
        saving={saving}
        onChange={async (show_friend_spots) => {
          await updateProfile({ show_friend_spots })
          window.dispatchEvent(new CustomEvent('mark-app:refetch-marks'))
          setSuccessMessage(
            show_friend_spots
              ? 'Friends\' shared spots are visible on your map.'
              : 'Friends\' shared spots are hidden on your map.',
          )
          setFormError(null)
        }}
      />

      <FriendsList disabled={!isAuthenticated || saving} />

      <DemoBotsPanel disabled={!isAuthenticated || saving} />

      {displayError ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border-2 border-red-400/50 bg-red-950/40 px-4 py-3 text-base text-foam"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" aria-hidden />
          {displayError}
        </p>
      ) : null}

      {successMessage ? (
        <p
          role="status"
          className="flex items-start gap-2 rounded-xl border-2 border-action/40 bg-action/10 px-4 py-3 text-base text-foam"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-action" aria-hidden />
          {successMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!isAuthenticated || saving}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-action text-xl font-bold text-action-text hover:bg-action-hover disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
            Saving…
          </>
        ) : (
          'Save profile'
        )}
      </button>
    </form>
  )
}

function SignInCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode
  title: string
  body: string
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:px-6">
      <div className="rounded-2xl border-2 border-ocean-600 bg-ocean-900 px-6 py-8 text-center">
        {icon}
        <p className="mt-4 text-xl font-bold text-foam">{title}</p>
        <p className="mt-2 text-base text-spray">{body}</p>
        <Link
          to="/login"
          className="mt-6 inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-action px-8 text-lg font-bold text-action-text hover:bg-action-hover"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}

function ProfileLoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-16 text-spray">
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      Loading profile…
    </div>
  )
}
