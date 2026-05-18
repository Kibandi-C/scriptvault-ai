import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useUIStore, useAuthStore } from '../../store'
import { Button } from './Button'
import { Input } from './Input'
import api from '../../services/api'

function LoginForm({ onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { closeAuthModal, addToast } = useUIStore()
  const setAuth = useAuthStore((s) => s.setAuth)

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/api/v1/auth/login', { email, password }).then((r) => r.data),
    onSuccess: (data) => {
      setAuth(data.access_token, data.user)
      closeAuthModal()
      addToast({ type: 'success', message: `Welcome back, ${data.user?.username || 'there'}.` })
    },
    onError: (e) => {
      addToast({
        type: 'error',
        message: e.response?.data?.detail?.message || 'Login failed.',
      })
    },
  })

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}
      className="space-y-4"
    >
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        required
        autoFocus
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        autoComplete="current-password"
        required
      />
      <Button variant="primary" className="w-full" type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Signing in...' : 'Sign In'}
      </Button>
      <p className="text-center text-sm text-[#9A9A9A]">
        No account?{' '}
        <button type="button" onClick={onSwitch} className="text-green hover:underline">
          Create one
        </button>
      </p>
    </form>
  )
}

function RegisterForm({ onSwitch }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', phone: '' })
  const { closeAuthModal, addToast } = useUIStore()
  const setAuth = useAuthStore((s) => s.setAuth)

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/api/v1/auth/register', form).then((r) => r.data),
    onSuccess: (data) => {
      setAuth(data.access_token, data.user)
      closeAuthModal()
      addToast({ type: 'success', message: 'Account created. Welcome to ScriptVault.' })
    },
    onError: (e) => {
      addToast({
        type: 'error',
        message: e.response?.data?.detail?.message || 'Registration failed.',
      })
    },
  })

  const field = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}
      className="space-y-4"
    >
      <Input label="Username" value={form.username} onChange={field('username')} placeholder="yourname" autoComplete="username" required autoFocus />
      <Input label="Email" type="email" value={form.email} onChange={field('email')} placeholder="you@example.com" autoComplete="email" required />
      <Input label="Password" type="password" value={form.password} onChange={field('password')} placeholder="Min 8 characters" autoComplete="new-password" required />
      <Input label="Phone (optional — for M-Pesa)" value={form.phone} onChange={field('phone')} placeholder="07XXXXXXXX" autoComplete="tel" />
      <Button variant="primary" className="w-full" type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating account...' : 'Create Account'}
      </Button>
      <p className="text-center text-sm text-[#9A9A9A]">
        Have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-green hover:underline">
          Sign in
        </button>
      </p>
    </form>
  )
}

export function AuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, openAuthModal } = useUIStore()
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (!authModalOpen) return
    const onKey = (e) => { if (e.key === 'Escape') closeAuthModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [authModalOpen, closeAuthModal])

  if (!authModalOpen || token) return null

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={authModalMode === 'login' ? 'Sign in' : 'Create account'}>
      <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm" onClick={closeAuthModal} aria-hidden="true" />
      <div className="relative glass-card max-w-sm w-full mx-4 p-8 shadow-modal fade-in">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-green font-bold font-mono text-sm">SV</span>
              <span className="text-[#4A4A4A] text-sm">/</span>
              <h2 className="text-lg font-semibold text-[#F0F0F0]">
                {authModalMode === 'login' ? 'Sign In' : 'Create Account'}
              </h2>
            </div>
            <p className="text-xs text-[#4A4A4A]">ScriptVault AI · Premium Script Generator</p>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close"
            className="text-[#4A4A4A] hover:text-[#9A9A9A] transition-colors text-xl leading-none mt-0.5 ml-4"
          >
            ×
          </button>
        </div>

        {authModalMode === 'login' ? (
          <LoginForm onSwitch={() => openAuthModal('register')} />
        ) : (
          <RegisterForm onSwitch={() => openAuthModal('login')} />
        )}
      </div>
    </div>
  )
}
