import React, { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { Wine, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { authApi, extractApiErrorMessage } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/store/toastStore'
import { getDefaultRouteForRole } from '@/utils/rbac'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated, user } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const defaultRoute = getDefaultRouteForRole(user?.role)

  if (isAuthenticated && defaultRoute !== '/login') return <Navigate to={defaultRoute} replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user, token } = await authApi.login({ email, password })
      login(user, token)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(getDefaultRouteForRole(user.role), { replace: true })
    } catch (error) {
      setError(extractApiErrorMessage(error, 'Email ou senha inválidos'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/3 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-sm relative animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-brand shadow-glow-amber flex items-center justify-center mb-4">
            <Wine className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">BarFlow</h1>
          <p className="text-gray-400 text-sm mt-1">Bar Management System</p>
        </div>

        {/* Form card */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-white text-xl mb-6">Sign in</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pointer-events-auto text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Use as suas credenciais para entrar.
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          Ainda nao tem conta?{' '}
          <Link to="/register" className="text-brand hover:text-brand-light transition-colors">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
