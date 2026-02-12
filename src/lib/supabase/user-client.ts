import { createClient } from '@supabase/supabase-js'
import { SignJWT } from 'jose'
import { Database } from '@/lib/supabase'

const jwtSecret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!)

export async function createUserClient(userId: string) {
  const jwt = await new SignJWT({
    sub: userId,
    role: 'authenticated',
    iss: 'supabase',
    aud: 'authenticated',
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(jwtSecret)

  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
