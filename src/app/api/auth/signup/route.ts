import { createClient } from '@/lib/supabase/server'
import { ok, error } from '@/lib/api/response'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return error('Email and password are required')
  }

  const supabase = await createClient()
  const { error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) return error(authError.message, 400)

  return ok({ success: true })
}
