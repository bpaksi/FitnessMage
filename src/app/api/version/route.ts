import { NextResponse } from 'next/server'

// Inlined at build time via next.config.ts env — changes every deployment
const BUILD_ID = process.env.BUILD_ID!

export function GET() {
  return NextResponse.json(
    { buildId: BUILD_ID },
    { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } },
  )
}
