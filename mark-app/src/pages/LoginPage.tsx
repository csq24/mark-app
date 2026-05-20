import { Fish, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isSupabaseConfigured } from '../lib/supabase'

type Mode = 'signin' | 'signup'

const inputClass =
  'w-full min-h-14 rounded-xl border-2 border-ocean-600 bg-ocean-800 px-4 text-xl text-foam placeholder:text-spray/50 focus:border-spray focus:outline-none focus:ring-2 focus:ring-spray/30'

export function LoginPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading, signIn, signUp } = useAuth()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  if (!authLoading && user) {
    return <Navigate to="/map" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)

    try {
      if (mode === 'signin') {
        const { error: signInError } = await signIn(email.trim(), password)
        if (signInError) {
          setError(signInError)
          return
        }
        navigate('/map', { replace: true })
        return
      }

      const { error: signUpError, needsEmailConfirmation } = await signUp(
        email.trim(),
        password,
        fullName,
      )

      if (signUpError) {
        setError(signUpError)
        return
      }

      if (needsEmailConfirmation) {
        setMessage('Check your email to confirm your account, then sign in.')
        setMode('signin')
        return
      }

      navigate('/map', { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-ocean-950">
      <header className="border-b-2 border-ocean-700 bg-ocean-900 px-6 py-8 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ocean-700 text-action">
            <Fish className="h-9 w-9" strokeWidth={2.25} aria-hidden />
          </div>
          <h1 className="text-3xl font-bold text-foam">
            {mode === 'signup' ? 'Join Mark' : 'Mark'}
          </h1>
          <p className="text-lg text-spray">Sign in to save Marks and catches</p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
        {!isSupabaseConfigured ? (
          <p className="rounded-2xl border-2 border-red-400/50 bg-red-950/40 px-4 py-4 text-lg text-foam">
            Add Supabase keys to <code className="text-action">.env</code> first.
            See <code className="text-action">.env.example</code>.
          </p>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border-2 border-ocean-700 bg-ocean-900 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setError(null)
                  setMessage(null)
                }}
                className={[
                  'min-h-12 rounded-xl text-lg font-bold transition-colors',
                  mode === 'signin'
                    ? 'bg-ocean-700 text-foam'
                    : 'text-spray hover:text-foam',
                ].join(' ')}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setError(null)
                  setMessage(null)
                }}
                className={[
                  'min-h-12 rounded-xl text-lg font-bold transition-colors',
                  mode === 'signup'
                    ? 'bg-ocean-700 text-foam'
                    : 'text-spray hover:text-foam',
                ].join(' ')}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
              {mode === 'signup' ? (
                <label className="block">
                  <span className="mb-2 block text-lg font-semibold text-foam">
                    Your name
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Captain name"
                    autoComplete="name"
                    className={inputClass}
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-lg font-semibold text-foam">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-lg font-semibold text-foam">
                  Password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={
                    mode === 'signup' ? 'new-password' : 'current-password'
                  }
                  className={inputClass}
                />
              </label>

              {error ? (
                <p
                  role="alert"
                  className="rounded-xl border-2 border-red-400/50 bg-red-950/40 px-4 py-3 text-base text-foam"
                >
                  {error}
                </p>
              ) : null}

              {message ? (
                <p
                  role="status"
                  className="rounded-xl border-2 border-action/40 bg-action/10 px-4 py-3 text-base text-foam"
                >
                  {message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting || authLoading}
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-action text-xl font-bold text-action-text hover:bg-action-hover disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                    Please wait…
                  </>
                ) : mode === 'signin' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </>
        )}

        <Link
          to="/map"
          className="mt-8 block text-center text-lg font-medium text-spray underline-offset-4 hover:text-foam hover:underline"
        >
          Back to map (view only)
        </Link>
      </main>
    </div>
  )
}
