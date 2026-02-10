'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/settings')
  }

  return (
    <Card className="border-[#1e293b] bg-[#0f172a]">
      <CardHeader className="text-center">
        <Link href="/landing" className="mb-2 text-sm text-[#64748b] hover:text-[#94a3b8]">
          &larr; Back
        </Link>
        <CardTitle className="text-xl text-[#f8fafc]">Sign In</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-center text-sm text-red-400">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#94a3b8]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="border-[#1e293b] bg-[#020817] text-[#f8fafc] placeholder:text-[#475569]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#94a3b8]">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                autoComplete="current-password"
                className="border-[#1e293b] bg-[#020817] pr-10 text-[#f8fafc] placeholder:text-[#475569]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="pb-2" />
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3b82f6] text-white hover:bg-[#2563eb]"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          <p className="text-center text-sm text-[#64748b]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#3b82f6] hover:text-[#60a5fa]">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
