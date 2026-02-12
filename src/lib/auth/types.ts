import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'

export type AuthMethod = 'session' | 'device-token'

export interface AuthResult {
  userId: string
  authMethod: AuthMethod
  supabase: SupabaseClient<Database>
}
