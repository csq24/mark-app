import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — Supabase features will not work.',
  )
}

// Placeholder keeps the app runnable in dev when .env is missing or empty.
const clientUrl = isSupabaseConfigured
  ? supabaseUrl
  : 'https://placeholder.supabase.co'
const clientKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'

export const supabase = createClient<Database>(clientUrl, clientKey)
