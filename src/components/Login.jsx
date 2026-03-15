import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0f172a' }}>
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ backgroundColor: '#6366f1' }}
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Stablecoin Tracker</h1>
          <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>
            6-week learning program
          </p>
        </div>

        {sent ? (
          <div className="rounded-xl p-5 text-center" style={{ backgroundColor: '#1e293b' }}>
            <div className="text-2xl mb-3">📬</div>
            <p className="font-medium text-white">Check your email</p>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>
              We sent a login link to <span className="text-white font-medium">{email}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="rounded-xl p-5" style={{ backgroundColor: '#1e293b' }}>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: '#cbd5e1' }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 text-sm"
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  focusRingColor: '#6366f1',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                onBlur={(e) => (e.target.style.borderColor = '#334155')}
              />

              {error && (
                <p className="mt-2 text-xs" style={{ color: '#f87171' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-lg py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ backgroundColor: '#6366f1' }}
              >
                {loading ? 'Sending…' : 'Send Magic Link'}
              </button>
            </div>

            <p className="mt-4 text-center text-xs" style={{ color: '#64748b' }}>
              No password needed — we'll email you a secure login link.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
