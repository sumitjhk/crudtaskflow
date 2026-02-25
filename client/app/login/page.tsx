'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/auth/login', form)
      if (data.success) {
        router.push('/dashboard')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'var(--accent)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Space Mono, monospace',
              fontWeight: 700,
              fontSize: '16px',
              color: '#0d0d0f',
            }}>T</div>
            <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              TaskFlow
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'Space Mono, monospace' }}>
            // sign in to continue
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '28px' }}>
            Enter your credentials to access your workspace
          </p>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label className="label">Email Address</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              className="btn btn-primary btn-full"
              type="submit"
              disabled={loading}
              style={{ marginTop: '8px', padding: '13px 20px', fontSize: '15px' }}
            >
              {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <hr className="divider" />

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ fontWeight: 600 }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}