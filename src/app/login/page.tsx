'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const supabase = createClient()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'signup') {
      if (password.length < 8) {
        setError('Password must be at least 8 characters.')
        setLoading(false)
        return
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) {
        setError(error.message)
      } else if (data.user) {
        // Create profile manually (no trigger dependency)
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          email: email,
        })
        // Auto sign in after signup (works when email confirm is disabled)
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) {
          setSuccess('Account created! Please sign in.')
          setMode('login')
        } else {
          router.push(redirectTo)
          router.refresh()
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push(redirectTo)
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <span className="text-5xl">🔍</span>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {mode === 'login'
            ? "Sign in to post items or claim what's yours"
            : 'Join Campus L&F to post and claim items'}
        </p>
      </div>

      <div className="card p-6">
        <div className="mb-6 flex rounded-xl border border-gray-200 p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccess('') }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              mode === 'login' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              mode === 'signup' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your name"
                className="input"
                required
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@college.edu"
              className="input"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Minimum 8 characters' : 'Your password'}
                className="input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          {success && (
            <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3"
          >
            {mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        By continuing, you agree to use this portal responsibly and honestly.
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-2xl bg-gray-100" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
