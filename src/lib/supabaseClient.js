/**
 * supabaseClient.js
 *
 * Initialises the Supabase JS client from Vite env vars.
 *
 * The client is exported as `supabase`. When the env vars are missing
 * (local dev without a Supabase project), `supabase` is null — all
 * callsites should guard with:
 *
 *   if (!supabase) return  // fall back to localStorage
 *
 * Switching to Supabase:
 *   1. Copy .env.example → .env.local
 *   2. Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 *   3. Each data layer (progressStorage, mistakesStorage, …) will check
 *      `supabase` and prefer it over localStorage.
 */

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key) : null

/** True when a real Supabase project is configured. */
export const isSupabaseEnabled = Boolean(supabase)
