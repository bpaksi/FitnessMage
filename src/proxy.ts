import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function isMobileUA(ua: string | null): boolean {
  if (!ua) return false
  return /android|iphone|ipad|ipod|mobile|webos/i.test(ua)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Create Supabase client to refresh session cookies
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  // Refresh session if it exists
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Only handle routing for the root path
  if (pathname === '/') {
    const ua = request.headers.get('user-agent')
    const hasDeviceToken = request.cookies.get('device-token')?.value

    if (isMobileUA(ua)) {
      const target = hasDeviceToken ? '/home' : '/link'
      return NextResponse.redirect(new URL(target, request.url))
    }

    // Desktop
    const target = user ? '/settings' : '/landing'
    return NextResponse.redirect(new URL(target, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon-.*\\.png|api/).*)'],
}
