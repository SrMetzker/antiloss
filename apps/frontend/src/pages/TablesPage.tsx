import React, { useMemo, useState } from 'react'
import axios from 'axios'
import { CheckCircle, Plus, ShoppingCart, Users } from 'lucide-react'
import {
  useAddItemToOpenOrder,
  useCloseOrder,
  useCreateOrder,
  useCreateTable,
  useProducts,
  useRecipes,
  useRemoveItemFromOpenOrder,
  useTableOrder,
  useTables,
} from '@/hooks'
import { Button } from '@/components/ui/Button'
import { EmptyState, PageLoader } from '@/components/ui/Card'
import { ConfirmModal, Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/utils/format'
import type { Table } from '@/types'

const TableCard: React.FC<{ table: Table; onClick: () => void }> = ({ table, onClick }) => {
  const config = {
    free: { label: 'Free', color: 'text-green-400', dot: 'bg-green-400' },
    occupied: { label: 'Occupied', color: 'text-brand', dot: 'bg-brand' },
    reserved: { label: 'Reserved', color: 'text-blue-400', dot: 'bg-blue-400' },
  }

  const status = config[table.status]

  return (
    <button
      onClick={onClick}
      className="card p-4 text-left hover:border-brand/30 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl font-display font-bold text-white">{table.number}</span>
        <span className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
      </div>
      <div className="text-xs text-gray-400 flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5" />
        Default capacity
      </div>
      <p className={`text-xs font-semibold mt-1.5 ${status.color}`}>{status.label}</p>
    </button>
  )
}

const OrderPanel: React.FC<{ table: Table; onClose: () => void }> = ({ table, onClose }) => {
  const { data: order, isLoading } = useTableOrder(table.id)
  const { data: products } = useProducts()
  const { data: recipes } = useRecipes()
  const createOrderMutation = useCreateOrder()
  const addOrderItemMutation = useAddItemToOpenOrder()
  const removeOrderItemMutation = useRemoveItemFromOpenOrder()
  const closeOrderMutation = useCloseOrder()

  const [search, setSearch] = useState('')
  const [showProducts, setShowProducts] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const [confirmNegativeStock, setConfirmNegativeStock] = useState(false)
  const [negativeStockMessage, setNegativeStockMessage] = useState('')
  const [cart, setCart] = useState<Record<string, number>>({})

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase()
    const sellableProductIds = new Set((recipes ?? []).map((recipe) => recipe.productId))

    return (products ?? []).filter((item) =>
      sellableProductIds.has(item.id) && item.name.toLowerCase().includes(term)
    )
  }, [products, recipes, search])

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([productId, quantity]) => {
        const product = (products ?? []).find((item) => item.id === productId)
        if (!product) return null
        return {
          productId,
          name: product.name,
          quantity,
          price: product.price,
          subtotal: product.price * quantity,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }, [cart, products])

  const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0)

  const addToCart = (productId: string) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }))
  }

  const updateCartQty = (productId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        const { [productId]: _removed, ...rest } = prev
        return rest
      }
      return { ...prev, [productId]: quantity }
    })
  }

  const handleCreateOrder = async () => {
    const payload = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }))

    await createOrderMutation.mutateAsync({
      tableId: table.id,
      items: payload,
    })

    setCart({})
  }

  const handleCloseOrder = async () => {
    if (!order) return

    try {
      await closeOrderMutation.mutateAsync({ orderId: order.id })
      setConfirmClose(false)
      onClose()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as
          | {
              code?: string
              error?: string
              details?: {
                shortages?: Array<{
                  ingredientName: string
                  shortBy: number
                }>
              }
            }
          | undefined

        if (responseData?.code === 'INSUFFICIENT_STOCK') {
          const shortages = responseData.details?.shortages ?? []
          const summary = shortages.length
            ? shortages.map((item) => `${item.ingredientName} (-${item.shortBy})`).join(', ')
            : 'Alguns ingredientes ficarão negativos.'

          setNegativeStockMessage(summary)
          setConfirmClose(false)
          setConfirmNegativeStock(true)
          return
        }
      }

      throw error
    }
  }

  const handleCloseOrderAllowNegative = async () => {
    if (!order) return

    await closeOrderMutation.mutateAsync({
      orderId: order.id,
      allowNegativeStock: true,
    })

    setConfirmNegativeStock(false)
    onClose()
  }

  const handleAddItemToOpenOrder = async (productId: string) => {
    if (!order) return
    await addOrderItemMutation.mutateAsync({
      orderId: order.id,
      productId,
      quantity: 1,
    })
  }

  const handleRemoveItemFromOpenOrder = async (itemId: string) => {
    if (!order) return
    await removeOrderItemMutation.mutateAsync({
      orderId: order.id,
      itemId,
    })
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="font-display font-bold text-white">Table {table.number}</h3>
      </div>

      {order ? (
        <>
          <div className="flex-1 overflow-y-auto space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="card-elevated p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{item.productName}</p>
                  <p className="text-xs text-gray-400">{item.quantity} x {formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-display font-bold text-brand">{formatCurrency(item.subtotal)}</p>
                  <button
                    onClick={() => void handleRemoveItemFromOpenOrder(item.id)}
                    className="w-7 h-7 rounded-lg bg-red-500/15 text-red-300"
                    title="Remove item"
                  >
                    -
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            <div className="card p-3 flex items-center justify-between">
              <span className="text-gray-400">Total</span>
              <span className="text-xl font-display font-bold text-brand">{formatCurrency(order.total)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowProducts(true)}
                loading={addOrderItemMutation.isPending}
              >
                Add items
              </Button>
              <Button
                icon={<CheckCircle className="w-4 h-4" />}
                className="flex-1"
                onClick={() => setConfirmClose(true)}
                loading={closeOrderMutation.isPending}
              >
                Close order
              </Button>
            </div>
          </div>

          <ConfirmModal
            isOpen={confirmClose}
            onClose={() => setConfirmClose(false)}
            onConfirm={handleCloseOrder}
            title="Close order"
            message={`Confirm closing the order for table ${table.number}?`}
            confirmLabel="Close"
            loading={closeOrderMutation.isPending}
          />

          <ConfirmModal
            isOpen={confirmNegativeStock}
            onClose={() => setConfirmNegativeStock(false)}
            onConfirm={handleCloseOrderAllowNegative}
            title="Stock will become negative"
            message={`The following ingredients will end up with negative stock: ${negativeStockMessage}. Do you want to close the order anyway?`}
            confirmLabel="Close anyway"
            loading={closeOrderMutation.isPending}
          />
        </>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-2">
            {cartItems.length === 0 ? (
              <EmptyState
                icon={<ShoppingCart className="w-6 h-6" />}
                title="No items"
                description="Add products to create the order"
              />
            ) : (
              cartItems.map((item) => (
                <div key={item.productId} className="card-elevated p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-bg-elevated text-gray-300"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-white font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-brand text-black"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 space-y-3">
            <div className="card p-3 flex items-center justify-between">
              <span className="text-gray-400">Total</span>
              <span className="text-xl font-display font-bold text-brand">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setShowProducts(true)}>
                Add items
              </Button>
              <Button
                className="flex-1"
                onClick={() => void handleCreateOrder()}
                loading={createOrderMutation.isPending}
                disabled={cartItems.length === 0}
              >
                Create order
              </Button>
            </div>
          </div>

        </>
      )}

      <Modal
        isOpen={showProducts}
        onClose={() => setShowProducts(false)}
        title="Add products"
        size="md"
      >
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="mb-4"
        />
        <div className="grid grid-cols-2 gap-2">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                if (order) {
                  void handleAddItemToOpenOrder(product.id)
                } else {
                  addToCart(product.id)
                }
              }}
              className="card-elevated p-3 text-left hover:border-brand/30"
            >
              <p className="font-semibold text-sm text-white">{product.name}</p>
              <p className="text-brand font-display font-bold mt-1">{formatCurrency(product.price)}</p>
            </button>
          ))}

          {!filteredProducts.length && (
            <div className="col-span-2 card p-3 text-sm text-gray-400 text-center">
              No products with recipes are available for sale.
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export const TablesPage: React.FC = () => {
  const { data: tables, isLoading } = useTables()
  const createTableMutation = useCreateTable()

  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [showCreateTable, setShowCreateTable] = useState(false)
  const [newTableNumber, setNewTableNumber] = useState<number>(0)

  const freeTables = tables?.filter((item) => item.status === 'free').length ?? 0
  const occupiedTables = tables?.filter((item) => item.status === 'occupied').length ?? 0

  const handleCreateTable = async () => {
    await createTableMutation.mutateAsync(newTableNumber)
    setShowCreateTable(false)
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Tables</h1>
          <div className="flex gap-4 mt-2">
            <span className="text-xs text-gray-400"><span className="text-green-400 font-bold">{freeTables}</span> free</span>
            <span className="text-xs text-gray-400"><span className="text-brand font-bold">{occupiedTables}</span> occupied</span>
          </div>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateTable(true)}>
          New table
        </Button>
      </div>

      {!tables?.length ? (
        <EmptyState title="No tables registered" description="Create the first table to get started" />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onClick={() => setSelectedTable(table)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedTable)}
        onClose={() => setSelectedTable(null)}
        title=""
        size="lg"
      >
        {selectedTable ? <OrderPanel table={selectedTable} onClose={() => setSelectedTable(null)} /> : null}
      </Modal>

      <Modal
        isOpen={showCreateTable}
        onClose={() => setShowCreateTable(false)}
        title="New table"
        size="sm"
        footer={
          <Button
            fullWidth
            onClick={() => void handleCreateTable()}
            loading={createTableMutation.isPending}
          >
            Create table
          </Button>
        }
      >
        <Input
          label="Number"
          type="number"
          min={1}
          value={newTableNumber}
          onChange={(event) => setNewTableNumber(Number(event.target.value) || 0)}
        />
      </Modal>
    </div>
  )
}
