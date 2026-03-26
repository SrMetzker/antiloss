import React, { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Building2, ChevronLeft, Mail, Phone, ShieldCheck, User2 } from 'lucide-react'
import { authApi, extractApiErrorMessage } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import type { PublicPlan } from '@/types'
import { getDefaultRouteForRole } from '@/utils/rbac'
import { ContactBar } from '@/components/ui/ContactBar'

const formatPrice = (priceCents: number, currency: string) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(priceCents / 100)
}

const billingLabel = (cycle: PublicPlan['billingCycle']) => {
  return cycle === 'YEARLY' ? 'yr' : 'mo'
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated, user } = useAuthStore()

  // Step control
  const [step, setStep] = useState<'personal' | 'plan'>('personal')

  // Step 1 fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [establishmentName, setEstablishmentName] = useState('')

  // Step 2 state
  const [plans, setPlans] = useState<PublicPlan[]>([])
  const [selectedPlanCode, setSelectedPlanCode] = useState('')
  const [loadingPlans, setLoadingPlans] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const defaultRoute = getDefaultRouteForRole(user?.role)

  if (isAuthenticated && defaultRoute !== '/login') {
    return <Navigate to={defaultRoute} replace />
  }

  const selectedPlan = useMemo(
    () => plans.find((item) => item.code === selectedPlanCode),
    [plans, selectedPlanCode]
  )

  const handleNext = async () => {
    setError('')

    if (!name.trim()) { setError('Name is required.'); return }
    if (!email.trim()) { setError('Email is required.'); return }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (!establishmentName.trim()) { setError('Establishment name is required.'); return }

    setSubmitting(true)
    try {
      // Capture the lead before showing plans
      await authApi.captureLead({
        name: name.trim(),
        email: email.trim(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        establishmentName: establishmentName.trim(),
      })

      // Load plans
      setLoadingPlans(true)
      const data = await authApi.getPublicPlans()
      setPlans(data)
      setSelectedPlanCode(data[0]?.code ?? '')
      if (!data.length) {
        setError('No active plans found. Please try again later.')
        return
      }
      setStep('plan')
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Error advancing. Please try again.'))
    } finally {
      setSubmitting(false)
      setLoadingPlans(false)
    }
  }

  const handleSubmit = async () => {
    setError('')
    setSubmitting(true)

    try {
      const result = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        establishmentName: establishmentName.trim(),
        planCode: selectedPlanCode || undefined,
      })

      login(result.user, result.token)
      toast.success('Account created successfully! Trial started.')
      navigate('/subscription', { replace: true })
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Could not create account'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-brand/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl relative animate-slide-up">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-display font-bold text-white">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Start your trial in minutes</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === 'personal' ? 'bg-brand text-black' : 'bg-brand/20 text-brand'}`}>
              1
            </div>
            <span className={`text-xs font-medium ${step === 'personal' ? 'text-white' : 'text-gray-400'}`}>Personal Data</span>
          </div>
          <div className="w-10 h-px bg-bg-border" />
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === 'plan' ? 'bg-brand text-black' : 'bg-bg-elevated text-gray-500'}`}>
              2
            </div>
            <span className={`text-xs font-medium ${step === 'plan' ? 'text-white' : 'text-gray-500'}`}>Choose Plan</span>
          </div>
        </div>

        {/* Step 1: Personal data */}
        {step === 'personal' && (
          <div className="card p-6 md:p-8">
            <h2 className="font-display font-semibold text-white text-lg mb-5">Personal and Establishment Data</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                label="Name"
                placeholder="Your name"
                leftIcon={<User2 className="w-4 h-4" />}
                required
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="Password"
                placeholder="Minimum 6 characters"
                leftIcon={<ShieldCheck className="w-4 h-4" />}
                minLength={6}
                required
              />

              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                label="Phone (optional)"
                placeholder="+34 999999999"
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <div className="md:col-span-2">
                <Input
                  value={establishmentName}
                  onChange={(e) => setEstablishmentName(e.target.value)}
                  label="Establishment Name"
                  placeholder="Central Bar"
                  leftIcon={<Building2 className="w-4 h-4" />}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <Button onClick={() => void handleNext()} loading={submitting} size="lg">
                Next →
              </Button>
              <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                Already have an account? Log in
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: Plan selection */}
        {step === 'plan' && (
          <div className="card p-6 md:p-8">
            <button
              type="button"
              onClick={() => { setError(''); setStep('personal') }}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-5"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <h2 className="font-display font-semibold text-white text-lg mb-5">Choose your plan</h2>

            {loadingPlans ? (
              <div className="card-elevated p-4 text-sm text-gray-300">Loading plans...</div>
            ) : plans.length === 0 ? (
              <div className="card-elevated p-4 text-sm text-gray-300">
                No plans available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {plans.map((plan) => {
                  const active = plan.code === selectedPlanCode
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanCode(plan.code)}
                      className={`text-left rounded-xl border p-4 transition-all ${
                        active
                          ? 'border-brand bg-brand/10 shadow-glow-amber'
                          : 'border-bg-border bg-bg-elevated hover:border-brand/40'
                      }`}
                    >
                      <p className="text-white font-display font-semibold">{plan.name}</p>
                      <p className="text-gray-400 text-xs mt-1 min-h-[30px]">{plan.description ?? 'No description'}</p>
                      <p className="text-brand font-bold mt-3">
                        {formatPrice(plan.priceCents, plan.currency)}/{billingLabel(plan.billingCycle)}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">Trial: {plan.trialDays} days</p>
                    </button>
                  )
                })}
              </div>
            )}

            {selectedPlan && (
              <div className="mt-4 card-elevated p-4 text-sm text-gray-200">
                <p className="font-semibold text-white mb-2">Summary — {selectedPlan.name}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <span>Users: {selectedPlan.maxUsers}</span>
                  <span>Products: {selectedPlan.maxProducts}</span>
                  <span>Tables: {selectedPlan.maxTables ?? 'Unlimited'}</span>
                  <span>Trial: {selectedPlan.trialDays} days</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="mt-6">
              <Button onClick={() => void handleSubmit()} loading={submitting} size="lg" fullWidth>
                Create account and start trial
              </Button>
            </div>
          </div>
        )}

        <ContactBar
          email="sr.metzker.lucas@gmail.com"
          whatsapp="34624250681"
          whatsappMessage="¡Hola! Necesito ayuda con Stratto."
        />
      </div>
    </div>
  )
}
