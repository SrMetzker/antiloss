import React, { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Building2, Mail, ShieldCheck, User2, Wine } from 'lucide-react'
import { authApi, extractApiErrorMessage } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import type { PublicPlan } from '@/types'
import { getDefaultRouteForRole } from '@/utils/rbac'

const formatPrice = (priceCents: number, currency: string) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(priceCents / 100)
}

const billingLabel = (cycle: PublicPlan['billingCycle']) => {
  return cycle === 'YEARLY' ? 'ano' : 'mes'
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated, user } = useAuthStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [establishmentName, setEstablishmentName] = useState('')
  const [plans, setPlans] = useState<PublicPlan[]>([])
  const [selectedPlanCode, setSelectedPlanCode] = useState('')
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const defaultRoute = getDefaultRouteForRole(user?.role)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoadingPlans(true)
      try {
        const data = await authApi.getPublicPlans()
        if (!cancelled) {
          setPlans(data)
          setSelectedPlanCode((prev) => prev || data[0]?.code || '')

          if (!data.length) {
            setError('Nenhum plano ativo foi encontrado. Tente novamente em instantes.')
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(extractApiErrorMessage(err, 'Nao foi possivel carregar os planos'))
        }
      } finally {
        if (!cancelled) {
          setLoadingPlans(false)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [])

  const selectedPlan = useMemo(
    () => plans.find((item) => item.code === selectedPlanCode),
    [plans, selectedPlanCode]
  )

  if (isAuthenticated && defaultRoute !== '/login') {
    return <Navigate to={defaultRoute} replace />
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const result = await authApi.register({
        name,
        email,
        password,
        establishmentName,
        planCode: selectedPlanCode || undefined,
      })

      login(result.user, result.token)
      toast.success('Conta criada com sucesso! Trial iniciado.')
      navigate('/subscription', { replace: true })
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Nao foi possivel criar a conta'))
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
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand shadow-glow-amber flex items-center justify-center mb-4">
            <Wine className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Criar conta</h1>
          <p className="text-gray-400 text-sm mt-1">Comece o trial do seu restaurante em minutos</p>
        </div>

        <div className="card p-6 md:p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              leftIcon={<User2 className="w-4 h-4" />}
              required
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="gestor@bar.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="No minimo 6 caracteres"
              leftIcon={<ShieldCheck className="w-4 h-4" />}
              minLength={6}
              required
            />

            <Input
              label="Nome do estabelecimento"
              value={establishmentName}
              onChange={(e) => setEstablishmentName(e.target.value)}
              placeholder="Bar Central"
              leftIcon={<Building2 className="w-4 h-4" />}
              required
            />

            <div className="md:col-span-2 mt-2">
              <p className="label mb-3">Escolha o plano</p>
              {loadingPlans ? (
                <div className="card-elevated p-4 text-sm text-gray-300">Carregando planos...</div>
              ) : plans.length === 0 ? (
                <div className="card-elevated p-4 text-sm text-gray-300">
                  Nenhum plano disponivel no momento.
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
                        <p className="text-gray-400 text-xs mt-1 min-h-[30px]">{plan.description ?? 'Plano sem descricao'}</p>
                        <p className="text-brand font-bold mt-3">
                          {formatPrice(plan.priceCents, plan.currency)}/{billingLabel(plan.billingCycle)}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">Trial: {plan.trialDays} dias</p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {selectedPlan && (
              <div className="md:col-span-2 card-elevated p-4 text-sm text-gray-200">
                <p className="font-semibold text-white mb-2">Resumo do plano {selectedPlan.name}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <span>Usuarios: {selectedPlan.maxUsers}</span>
                  <span>Produtos: {selectedPlan.maxProducts}</span>
                  <span>Mesas: {selectedPlan.maxTables ?? 'Ilimitado'}</span>
                  <span>Trial: {selectedPlan.trialDays} dias</span>
                </div>
              </div>
            )}

            {error && (
              <div className="md:col-span-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="md:col-span-2 mt-2 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <Button type="submit" loading={submitting} size="lg">
                Criar conta e iniciar trial
              </Button>
              <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                Ja tem conta? Entrar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
