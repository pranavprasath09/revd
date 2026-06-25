import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * True when a PostgREST error is "column does not exist" (Postgres 42703).
 * Lets a query optimistically request a newly-added column (e.g. a migration-015
 * counter) and fall back to the base columns if the migration isn't applied yet,
 * so a deploy can never break the page on the column's absence.
 */
export function isMissingColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  return error.code === '42703' || /column .* does not exist/i.test(error.message ?? '')
}
