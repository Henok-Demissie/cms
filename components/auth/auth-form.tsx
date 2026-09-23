'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isSignUp = mode === 'sign-up'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    const result = isSignUp
      ? await authClient.signUp.email({ name, email, password })
      : await authClient.signIn.email({ email, password })
    setLoading(false)
    if (result.error) {
      setError('We could not complete that request. Check your details and try again.')
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-svh bg-[#f7f9fc] px-4 py-8 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_rgba(15,35,70,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden bg-[#2447b8] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div>
            <div className="flex items-center gap-3 text-2xl font-bold tracking-tight"><span className="grid size-10 place-items-center rounded-xl bg-white/15">D</span> dataSell</div>
            <div className="mt-20 max-w-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">Longer-lasting data</p>
              <h2 className="mt-5 text-4xl font-bold leading-tight">Simple data buying, made dependable.</h2>
              <p className="mt-5 text-base leading-7 text-blue-100">Buy affordable bundles, track every order, and keep your account balance in one secure place.</p>
            </div>
          </div>
          <p className="text-sm text-blue-100">Secure account access for every customer.</p>
        </section>

        <section className="flex items-center px-6 py-10 sm:px-12 lg:px-14">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-9 lg:hidden"><div className="flex items-center gap-3 text-2xl font-bold text-[#2447b8]"><span className="grid size-10 place-items-center rounded-xl bg-[#2447b8] text-white">D</span> dataSell</div></div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2447b8]">{isSignUp ? 'Get started' : 'Welcome back'}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{isSignUp ? 'Create your account' : 'Sign in to dataSell'}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">{isSignUp ? 'Create a real account to buy data and track your orders.' : 'Access your balance, orders, and data purchases.'}</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {isSignUp && <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Full name</span><input className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#2447b8] focus:bg-white focus:ring-4 focus:ring-blue-100" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" /></label>}
              <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Email address</span><input className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#2447b8] focus:bg-white focus:ring-4 focus:ring-blue-100" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
              <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Password</span><input className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#2447b8] focus:bg-white focus:ring-4 focus:ring-blue-100" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete={isSignUp ? 'new-password' : 'current-password'} /></label>
              {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
              <button className="h-12 w-full rounded-xl bg-[#2447b8] text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#19399d] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>{loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}</button>
            </form>
            <p className="mt-8 text-center text-sm text-slate-500">{isSignUp ? 'Already have an account?' : "Don't have an account?"} <Link className="font-semibold text-[#2447b8] hover:underline" href={isSignUp ? '/sign-in' : '/sign-up'}>{isSignUp ? 'Sign in' : 'Create one'}</Link></p>
          </div>
        </section>
      </div>
    </main>
  )
}
