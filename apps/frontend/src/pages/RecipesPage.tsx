import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, BookOpen, Edit2, Trash2, ChevronDown, ChevronUp, Beaker, X } from 'lucide-react'
import { useRecipes, useCreateRecipe, useUpdateRecipe, useDeleteRecipe, useProducts, useIngredients } from '@/hooks'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { EmptyState, PageLoader } from '@/components/ui/Card'
import type { Recipe, RecipeFormData, RecipeIngredient, StockUnit } from '@/types'

const UNITS: StockUnit[] = ['ml', 'cl', 'l', 'g', 'kg', 'unit', 'bottle']

const defaultForm: RecipeFormData = {
  productId: '', instructions: '', ingredients: [],
}

const RecipeCard: React.FC<{
  recipe: Recipe
  onEdit: () => void
  onDelete: () => void
}> = ({ recipe, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-muted border border-brand/20 flex items-center justify-center">
            <Beaker className="w-5 h-5 text-brand" />
          </div>
          <div>
            <p className="font-display font-bold text-white">{recipe.productName}</p>
            <p className="text-xs text-gray-400">{recipe.ingredients.length} ingredients</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit() }}
            className="p-2 rounded-xl text-gray-400 hover:text-brand hover:bg-brand-muted transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-bg-border animate-slide-up">
          {recipe.instructions && (
            <p className="text-sm text-gray-300 mt-3 mb-3 italic">{recipe.instructions}</p>
          )}
          <div className="flex flex-col gap-2">
            {recipe.ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-bg-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                  <span className="text-sm text-gray-200">{ing.ingredientName}</span>
                </div>
                <span className="text-sm font-semibold text-white">
                  {ing.quantity} {ing.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export const RecipesPage: React.FC = () => {
  const location = useLocation()
  const { data: recipes, isLoading } = useRecipes()
  const { data: products } = useProducts()
  const { data: ingredients } = useIngredients()
  const createMutation = useCreateRecipe()
  const updateMutation = useUpdateRecipe()
  const deleteMutation = useDeleteRecipe()

  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [form, setForm] = useState<RecipeFormData>(defaultForm)

  useEffect(() => {
    const stateProductId = (location.state as { productId?: string } | null)?.productId
    if (!stateProductId || !products || recipes === undefined) return

    const existingRecipe = (recipes ?? []).find((recipe) => recipe.productId === stateProductId)

    if (existingRecipe) {
      openEdit(existingRecipe)
      return
    }

    setEditingRecipe(null)
    setForm({ ...defaultForm, productId: stateProductId })
    setModalOpen(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, products, recipes])

  const openCreate = () => {
    setEditingRecipe(null)
    setForm({ ...defaultForm, productId: products?.[0]?.id ?? '' })
    setModalOpen(true)
  }

  const openEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setForm({
      productId: recipe.productId,
      instructions: recipe.instructions,
      ingredients: [...recipe.ingredients],
    })
    setModalOpen(true)
  }

  const addIngredientRow = () => {
    setForm((f) => ({
      ...f,
      ingredients: [
        ...f.ingredients,
        { ingredientId: ingredients?.[0]?.id ?? '', ingredientName: ingredients?.[0]?.name ?? '', quantity: 0, unit: ingredients?.[0]?.unit ?? 'ml' },
      ],
    }))
  }

  const updateIngredient = (idx: number, field: keyof RecipeIngredient, value: string | number) => {
    setForm((f) => {
      const updated = [...f.ingredients]
      if (field === 'ingredientId') {
        const ing = ingredients?.find((i) => i.id === value)
        updated[idx] = {
          ...updated[idx],
          ingredientId: value as string,
          ingredientName: ing?.name ?? '',
          unit: ing?.unit ?? 'ml',
        }
      } else {
        updated[idx] = { ...updated[idx], [field]: value }
      }
      return { ...f, ingredients: updated }
    })
  }

  const removeIngredient = (idx: number) => {
    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (editingRecipe) {
      await updateMutation.mutateAsync({ id: editingRecipe.productId, data: form })
    } else {
      await createMutation.mutateAsync(form)
    }
    setModalOpen(false)
  }

  const handleDelete = async () => {
    if (!confirmId) return
    await deleteMutation.mutateAsync(confirmId)
    setConfirmId(null)
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Recipes</h1>
          <p className="text-gray-400 text-sm mt-0.5">{recipes?.length ?? 0} recipes</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
          Add Recipe
        </Button>
      </div>

      {!recipes?.length ? (
        <EmptyState
          icon={<BookOpen className="w-7 h-7" />}
          title="No recipes yet"
          description="Define how products consume ingredients"
          action={<Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Add Recipe</Button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onEdit={() => openEdit(recipe)}
              onDelete={() => setConfirmId(recipe.productId)}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRecipe ? 'Edit Recipe' : 'New Recipe'}
        size="lg"
        footer={
          <Button
            fullWidth
            loading={createMutation.isPending || updateMutation.isPending}
            onClick={() => void handleSubmit()}
          >
            {editingRecipe ? 'Save Changes' : 'Create Recipe'}
          </Button>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select
            label="Product"
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
            options={products?.map((p) => ({ value: p.id, label: p.name })) ?? []}
          />
          <Textarea
            label="Instructions (optional)"
            value={form.instructions ?? ''}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            placeholder="Describe how to prepare this recipe..."
            rows={2}
          />

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">Ingredients</label>
            </div>

            {form.ingredients.length === 0 ? (
              <div className="card p-4 text-center text-gray-500 text-sm">
                No ingredients. Click "Add Ingredient" to add ingredients.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {form.ingredients.map((ing, idx) => (
                  <div key={idx} className="card-elevated p-3 flex items-end gap-2">
                    <div className="flex-1">
                      <Select
                        label={idx === 0 ? 'Ingredient' : undefined}
                        value={ing.ingredientId}
                        onChange={(e) => updateIngredient(idx, 'ingredientId', e.target.value)}
                        options={ingredients?.map((i) => ({ value: i.id, label: i.name })) ?? []}
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        label={idx === 0 ? 'Qty' : undefined}
                        type="number"
                        step="0.1"
                        min="0"
                        value={ing.quantity}
                        onChange={(e) => updateIngredient(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="w-20">
                      <Select
                        label={idx === 0 ? 'Unit' : undefined}
                        value={ing.unit}
                        onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                        options={UNITS.map((u) => ({ value: u, label: u }))}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIngredient(idx)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0 mb-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="secondary"
              fullWidth
              className="mt-3"
              onClick={addIngredientRow}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Ingredient
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe?"
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
