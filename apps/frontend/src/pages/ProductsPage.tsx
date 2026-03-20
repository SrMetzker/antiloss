import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, Package, BookOpen } from 'lucide-react'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useRecipes } from '@/hooks'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Badge, EmptyState, ErrorState, PageLoader } from '@/components/ui/Card'
import { formatCurrency, categoryLabel } from '@/utils/format'
import type { Product, ProductFormData, ProductCategory } from '@/types'

const CATEGORIES: ProductCategory[] = ['spirits', 'beer', 'wine', 'cocktails', 'soft_drinks', 'food', 'other']

const categoryColors: Record<ProductCategory, 'green' | 'blue' | 'amber' | 'gray'> = {
  spirits: 'amber', beer: 'amber', wine: 'blue',
  cocktails: 'green', soft_drinks: 'blue', food: 'gray', other: 'gray',
}

const defaultForm: ProductFormData = {
  name: '', price: 0, sku: '', category: 'cocktails',
}

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: products, isLoading, isError, refetch } = useProducts()
  const { data: recipes } = useRecipes()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const deleteMutation = useDeleteProduct()

  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductFormData>(defaultForm)

  const filtered = useMemo(() => {
    if (!products) return []
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      const matchCat = filterCat === 'all' || p.category === filterCat
      return matchSearch && matchCat
    })
  }, [products, search, filterCat])

  const recipeProductIds = useMemo(
    () => new Set((recipes ?? []).map((recipe) => recipe.productId)),
    [recipes]
  )

  const openCreate = () => {
    setEditingProduct(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      price: product.price,
      sku: product.sku,
      category: product.category,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct.id, data: form })
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
  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="text-gray-400 text-sm mt-0.5">{products?.length ?? 0} items</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
          Add Product
        </Button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="input-field w-auto !px-3 min-w-[110px]"
        >
          <option value="all">All</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{categoryLabel(c)}</option>
          ))}
        </select>
      </div>

      {/* Product list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="w-7 h-7" />}
          title="No products found"
          description={search ? `No results for "${search}"` : 'Start by adding your first product'}
          action={<Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Add Product</Button>}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((product) => {
            const hasRecipe = recipeProductIds.has(product.id)

            return (
              <div
                key={product.id}
                className="card px-4 py-3 flex items-center gap-3 hover:border-bg-border/80 transition-colors"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-gray-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white text-sm">{product.name}</p>
                    <Badge variant={categoryColors[product.category]}>
                      {categoryLabel(product.category)}
                    </Badge>
                    <Badge variant={hasRecipe ? 'green' : 'red'}>
                      {hasRecipe ? 'With recipe' : 'Without recipe'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">SKU: {product.sku}</p>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="font-display font-bold text-brand">{formatCurrency(product.price)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => navigate('/recipes', { state: { productId: product.id } })}
                    className="p-2 rounded-xl text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    title="Create/edit recipe"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEdit(product)}
                    className="p-2 rounded-xl text-gray-400 hover:text-brand hover:bg-brand-muted transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmId(product.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'New Product'}
        size="md"
        footer={
          <Button
            fullWidth
            loading={createMutation.isPending || updateMutation.isPending}
            onClick={() => void handleSubmit()}
          >
            {editingProduct ? 'Save Changes' : 'Create Product'}
          </Button>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Product Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Mojito"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price (€)"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="CKT-001"
              required
            />
          </div>
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
            options={CATEGORIES.map((c) => ({ value: c, label: categoryLabel(c) }))}
          />
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
