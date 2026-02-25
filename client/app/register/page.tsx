'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/auth/register', form)
      if (data.success) {
        router.push('/dashboard')
      } else {
        // Handle validation errors array or single message
        if (data.errors && data.errors.length > 0) {
          setError(data.errors.map((e: { message: string }) => e.message).join(', '))
        } else {
          setError(data.message || 'Registration failed')
        }
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
            // create your account
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            Get started
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '28px' }}>
            Create your TaskFlow account — it&apos;s free
          </p>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label className="label">Full Name</label>
              <input
                className="input"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Email Address</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="Min. 6 characters with a number"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '5px', fontFamily: 'Space Mono, monospace' }}>
                Must be 6+ chars and contain at least one number
              </p>
            </div>

            <button
              className="btn btn-primary btn-full"
              type="submit"
              disabled={loading}
              style={{ marginTop: '8px', padding: '13px 20px', fontSize: '15px' }}
            >
              {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account →'}
            </button>
          </form>

          <hr className="divider" />

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}