import React, { useState } from 'react'
import { Plus, Warehouse, TrendingUp, TrendingDown, Minus, RefreshCw, AlertTriangle } from 'lucide-react'
import { useIngredients, useStockMovements, useCreateMovement } from '@/hooks'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Badge, EmptyState, PageLoader } from '@/components/ui/Card'
import { formatRelativeTime, movementLabel, movementColor } from '@/utils/format'
import type { MovementType, StockMovementFormData, StockUnit } from '@/types'

const MOVEMENT_TYPES: { value: MovementType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'IN', label: 'Stock In', icon: <TrendingUp className="w-4 h-4" />, color: 'bg-green-500/10 border-green-500/20 text-green-400' },
  { value: 'OUT', label: 'Stock Out', icon: <TrendingDown className="w-4 h-4" />, color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  { value: 'LOSS', label: 'Loss', icon: <Minus className="w-4 h-4" />, color: 'bg-red-500/10 border-red-500/20 text-red-400' },
  { value: 'ADJUSTMENT', label: 'Adjustment', icon: <RefreshCw className="w-4 h-4" />, color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
]

const UNITS: StockUnit[] = ['unit', 'bottle', 'ml', 'cl', 'l', 'g', 'kg']

const defaultForm: StockMovementFormData = {
  ingredientId: undefined,
  ingredientName: '',
  unit: 'unit',
  minimumStock: 0,
  type: 'IN',
  quantity: 0,
  reason: '',
}

export const InventoryPage: React.FC = () => {
  const { data: ingredients, isLoading: loadingIng } = useIngredients()
  const { data: movements, isLoading: loadingMov } = useStockMovements()
  const createMutation = useCreateMovement()

  const [tab, setTab] = useState<'stock' | 'movements'>('stock')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<StockMovementFormData>(defaultForm)

  const lowStockIngredients = ingredients?.filter((i: any) => i.currentStock <= i.minStock) ?? []

  const openModal = (type: MovementType = 'IN', ingredientId?: string) => {
    const selectedIngredient = ingredients?.find((item: any) => item.id === ingredientId)

    setForm({
      ingredientId: selectedIngredient?.id,
      ingredientName: selectedIngredient?.name ?? '',
      unit: selectedIngredient?.unit ?? 'unit',
      minimumStock: selectedIngredient?.minStock ?? 0,
      type,
      quantity: 0,
      reason: '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    await createMutation.mutateAsync(form)
    setModalOpen(false)
  }

  if (loadingIng || loadingMov) return <PageLoader />

  const stockPercent = (current: number, min: number) =>
    Math.min(100, Math.round((current / (min * 3)) * 100))

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="page-title">Inventory</h1>
          {lowStockIngredients.length > 0 && (
            <p className="text-amber-400 text-sm font-medium flex items-center gap-1.5 mt-0.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {lowStockIngredients.length} items low
            </p>
          )}
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => openModal()}>
          Movement
        </Button>
      </div>

      {/* Quick movement buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {MOVEMENT_TYPES.map((mt) => (
          <button
            key={mt.value}
            onClick={() => openModal(mt.value)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all active:scale-95 ${mt.color}`}
          >
            {mt.icon}
            {mt.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-elevated p-1 rounded-xl mb-5">
        {(['stock', 'movements'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-brand text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t === 'stock' ? 'Current Stock' : 'Movements'}
          </button>
        ))}
      </div>

      {/* Stock tab */}
      {tab === 'stock' && (
        <div className="flex flex-col gap-2">
          {!ingredients?.length ? (
            <EmptyState icon={<Warehouse className="w-7 h-7" />} title="No ingredients" />
          ) : (
            ingredients.map((ing: any) => {
              const pct = stockPercent(ing.currentStock, ing.minStock)
              const isLow = ing.currentStock <= ing.minStock
              return (
                <div key={ing.id} className="card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white text-sm">{ing.name}</p>
                        {isLow && <Badge variant="red">Low</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 capitalize">{ing.category} · {ing.unit}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className={`font-display font-bold ${isLow ? 'text-red-400' : 'text-white'}`}>
                        {ing.currentStock} <span className="text-sm font-body font-normal text-gray-400">{ing.unit}</span>
                      </p>
                      <p className="text-xs text-gray-500">min: {ing.minStock}</p>
                    </div>
                  </div>
                  {/* Stock bar */}
                  <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLow ? 'bg-red-400' : pct < 50 ? 'bg-amber-400' : 'bg-green-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Movements tab */}
      {tab === 'movements' && (
        <div className="flex flex-col gap-2">
          {!movements?.length ? (
            <EmptyState title="No movements yet" />
          ) : (
            movements.map((mov: any) => (
              <div key={mov.id} className="card px-4 py-3 flex items-center gap-3">
                <div className={`p-2 rounded-xl flex-shrink-0 ${movementColor(mov.type).replace('badge-', 'bg-').replace('green', 'green-500/10 text-green-400').replace('red', 'red-500/10 text-red-400').replace('blue', 'blue-500/10 text-blue-400').replace('amber', 'amber-500/10 text-amber-400')}`}>
                  {mov.type === 'IN' ? <TrendingUp className="w-4 h-4" />
                   : mov.type === 'LOSS' ? <Minus className="w-4 h-4" />
                   : mov.type === 'ADJUSTMENT' ? <RefreshCw className="w-4 h-4" />
                   : <TrendingDown className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{mov.ingredientName}</p>
                  <p className="text-xs text-gray-500">
                    {mov.reason ?? movementLabel(mov.type)} · {formatRelativeTime(mov.createdAt)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-sm text-white">
                    {mov.type === 'IN' ? '+' : '-'}{mov.quantity} {mov.unit}
                  </p>
                  <span className={movementColor(mov.type)}>
                    {movementLabel(mov.type)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Movement form modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register Movement"
        size="md"
        footer={
          <Button fullWidth loading={createMutation.isPending} onClick={() => void handleSubmit()}>
            Register
          </Button>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Ingredient"
            value={form.ingredientName}
            onChange={(e) => {
              const typed = e.target.value
              const existing = ingredients?.find((item: any) => item.name.toLowerCase() === typed.toLowerCase())

              setForm({
                ...form,
                ingredientName: typed,
                ingredientId: existing?.id,
                unit: existing?.unit ?? form.unit,
                minimumStock: existing?.minStock ?? form.minimumStock,
              })
            }}
            list="ingredient-options"
            placeholder="Digite para buscar ou criar ingrediente"
            required
          />

          <datalist id="ingredient-options">
            {(ingredients ?? []).map((item: any) => (
              <option key={item.id} value={item.name}>
                {item.name} ({item.currentStock} {item.unit})
              </option>
            ))}
          </datalist>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Unit"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value as StockUnit })}
              options={UNITS.map((unit) => ({ value: unit, label: unit }))}
            />
            <Input
              disabled={form.ingredientId !== undefined}
              label="Minimum Stock"
              type="number"
              min="0"
              step="0.1"
              value={form.minimumStock ?? 0}
              onChange={(e) => setForm({ ...form, minimumStock: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {MOVEMENT_TYPES.map((mt) => (
              <button
                key={mt.value}
                type="button"
                onClick={() => setForm({ ...form, type: mt.value })}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all
                  ${form.type === mt.value ? mt.color : 'border-bg-border text-gray-400 hover:text-white'}`}
              >
                {mt.icon} {mt.label}
              </button>
            ))}
          </div>
          <Input
            label={form.type === 'ADJUSTMENT' ? 'New Total Quantity' : 'Quantity'}
            type="number"
            step="0.1"
            min="0"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })}
            hint={
              ingredients?.find((i: any) => i.id === form.ingredientId)
                ? `Current: ${ingredients.find((i: any) => i.id === form.ingredientId)!.currentStock} ${ingredients.find((i: any) => i.id === form.ingredientId)!.unit}`
                : undefined
            }
            required
          />
          <Input
            label="Reason (optional)"
            value={form.reason ?? ''}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="e.g. Weekly delivery, bottle broken..."
          />
        </form>
      </Modal>
    </div>
  )
}
