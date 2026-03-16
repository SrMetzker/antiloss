import type {
  Product,
  Ingredient,
  Recipe,
  Table,
  Order,
  StockMovement,
  DailySales,
  TopProduct,
} from '@/types'

// ─── Products ────────────────────────────────────────────────────────────────
export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Mojito', price: 9.5, sku: 'CKT-001', category: 'cocktails', stock: 50, lowStockThreshold: 10, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'p2', name: 'Negroni', price: 11.0, sku: 'CKT-002', category: 'cocktails', stock: 40, lowStockThreshold: 10, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'p3', name: 'Aperol Spritz', price: 8.5, sku: 'CKT-003', category: 'cocktails', stock: 3, lowStockThreshold: 10, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'p4', name: 'IPA Craft Beer', price: 6.0, sku: 'BER-001', category: 'beer', stock: 60, lowStockThreshold: 12, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'p5', name: 'House Wine Red', price: 7.0, sku: 'WNE-001', category: 'wine', stock: 2, lowStockThreshold: 6, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'p6', name: 'Gin & Tonic', price: 10.0, sku: 'CKT-004', category: 'cocktails', stock: 35, lowStockThreshold: 10, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'p7', name: 'Whiskey Sour', price: 12.0, sku: 'CKT-005', category: 'cocktails', stock: 28, lowStockThreshold: 8, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'p8', name: 'Coca-Cola', price: 3.0, sku: 'SFT-001', category: 'soft_drinks', stock: 100, lowStockThreshold: 24, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'p9', name: 'Nachos', price: 8.0, sku: 'FOD-001', category: 'food', stock: 20, lowStockThreshold: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'p10', name: 'Rum & Coke', price: 8.0, sku: 'CKT-006', category: 'cocktails', stock: 45, lowStockThreshold: 10, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
]

// ─── Ingredients ─────────────────────────────────────────────────────────────
export const MOCK_INGREDIENTS: Ingredient[] = [
  { id: 'i1', name: 'White Rum', unit: 'ml', currentStock: 2400, minStock: 500, costPerUnit: 0.02, category: 'spirits' },
  { id: 'i2', name: 'Gin', unit: 'ml', currentStock: 1800, minStock: 500, costPerUnit: 0.025, category: 'spirits' },
  { id: 'i3', name: 'Aperol', unit: 'ml', currentStock: 600, minStock: 300, costPerUnit: 0.03, category: 'spirits' },
  { id: 'i4', name: 'Bourbon Whiskey', unit: 'ml', currentStock: 200, minStock: 400, costPerUnit: 0.04, category: 'spirits' },
  { id: 'i5', name: 'Campari', unit: 'ml', currentStock: 1200, minStock: 300, costPerUnit: 0.03, category: 'spirits' },
  { id: 'i6', name: 'Sweet Vermouth', unit: 'ml', currentStock: 900, minStock: 200, costPerUnit: 0.02, category: 'spirits' },
  { id: 'i7', name: 'Lime Juice', unit: 'ml', currentStock: 500, minStock: 200, costPerUnit: 0.01, category: 'mixers' },
  { id: 'i8', name: 'Mint Leaves', unit: 'g', currentStock: 150, minStock: 50, costPerUnit: 0.05, category: 'garnish' },
  { id: 'i9', name: 'Sugar Syrup', unit: 'ml', currentStock: 1000, minStock: 200, costPerUnit: 0.005, category: 'mixers' },
  { id: 'i10', name: 'Tonic Water', unit: 'ml', currentStock: 4800, minStock: 1000, costPerUnit: 0.003, category: 'mixers' },
  { id: 'i11', name: 'Prosecco', unit: 'ml', currentStock: 450, minStock: 750, costPerUnit: 0.015, category: 'wine' },
  { id: 'i12', name: 'Orange Juice', unit: 'ml', currentStock: 2000, minStock: 500, costPerUnit: 0.005, category: 'mixers' },
  { id: 'i13', name: 'Egg White', unit: 'unit', currentStock: 24, minStock: 12, costPerUnit: 0.3, category: 'other' },
  { id: 'i14', name: 'Lemon Juice', unit: 'ml', currentStock: 400, minStock: 200, costPerUnit: 0.01, category: 'mixers' },
  { id: 'i15', name: 'Angostura Bitters', unit: 'ml', currentStock: 80, minStock: 30, costPerUnit: 0.1, category: 'mixers' },
]

// ─── Recipes ─────────────────────────────────────────────────────────────────
export const MOCK_RECIPES: Recipe[] = [
  {
    id: 'r1', productId: 'p1', productName: 'Mojito',
    instructions: 'Muddle mint and lime. Add rum and syrup. Top with soda. Stir gently.',
    ingredients: [
      { ingredientId: 'i1', ingredientName: 'White Rum', quantity: 50, unit: 'ml' },
      { ingredientId: 'i7', ingredientName: 'Lime Juice', quantity: 25, unit: 'ml' },
      { ingredientId: 'i8', ingredientName: 'Mint Leaves', quantity: 8, unit: 'g' },
      { ingredientId: 'i9', ingredientName: 'Sugar Syrup', quantity: 15, unit: 'ml' },
    ],
    createdAt: '2024-01-01', updatedAt: '2024-01-01',
  },
  {
    id: 'r2', productId: 'p2', productName: 'Negroni',
    instructions: 'Stir all ingredients with ice. Strain into rocks glass. Garnish with orange peel.',
    ingredients: [
      { ingredientId: 'i2', ingredientName: 'Gin', quantity: 30, unit: 'ml' },
      { ingredientId: 'i5', ingredientName: 'Campari', quantity: 30, unit: 'ml' },
      { ingredientId: 'i6', ingredientName: 'Sweet Vermouth', quantity: 30, unit: 'ml' },
    ],
    createdAt: '2024-01-01', updatedAt: '2024-01-01',
  },
  {
    id: 'r3', productId: 'p3', productName: 'Aperol Spritz',
    instructions: 'Fill glass with ice. Add Aperol, then Prosecco, then orange juice.',
    ingredients: [
      { ingredientId: 'i3', ingredientName: 'Aperol', quantity: 60, unit: 'ml' },
      { ingredientId: 'i11', ingredientName: 'Prosecco', quantity: 90, unit: 'ml' },
      { ingredientId: 'i12', ingredientName: 'Orange Juice', quantity: 30, unit: 'ml' },
    ],
    createdAt: '2024-01-01', updatedAt: '2024-01-01',
  },
  {
    id: 'r4', productId: 'p7', productName: 'Whiskey Sour',
    instructions: 'Dry shake all ingredients. Add ice and shake again. Strain.',
    ingredients: [
      { ingredientId: 'i4', ingredientName: 'Bourbon Whiskey', quantity: 60, unit: 'ml' },
      { ingredientId: 'i14', ingredientName: 'Lemon Juice', quantity: 30, unit: 'ml' },
      { ingredientId: 'i9', ingredientName: 'Sugar Syrup', quantity: 15, unit: 'ml' },
      { ingredientId: 'i13', ingredientName: 'Egg White', quantity: 1, unit: 'unit' },
    ],
    createdAt: '2024-01-01', updatedAt: '2024-01-01',
  },
]

// ─── Tables ───────────────────────────────────────────────────────────────────
export const MOCK_TABLES: Table[] = [
  { id: 't1', number: 1, capacity: 2, status: 'occupied', activeOrderId: 'o1' },
  { id: 't2', number: 2, capacity: 4, status: 'free' },
  { id: 't3', number: 3, capacity: 4, status: 'occupied', activeOrderId: 'o2' },
  { id: 't4', number: 4, capacity: 6, status: 'free' },
  { id: 't5', number: 5, capacity: 2, status: 'reserved' },
  { id: 't6', number: 6, capacity: 8, status: 'free' },
  { id: 't7', number: 7, capacity: 4, status: 'occupied', activeOrderId: 'o3' },
  { id: 't8', number: 8, capacity: 2, status: 'free' },
  { id: 't9', number: 9, capacity: 6, status: 'free' },
  { id: 't10', number: 10, capacity: 4, status: 'free' },
  { id: 't11', number: 11, capacity: 2, status: 'free' },
  { id: 't12', number: 12, capacity: 10, status: 'reserved' },
]

// ─── Orders ───────────────────────────────────────────────────────────────────
export const MOCK_ORDERS: Order[] = [
  {
    id: 'o1', tableId: 't1', tableNumber: 1, status: 'open',
    items: [
      { id: 'oi1', productId: 'p1', productName: 'Mojito', price: 9.5, quantity: 2, subtotal: 19.0 },
      { id: 'oi2', productId: 'p8', productName: 'Coca-Cola', price: 3.0, quantity: 1, subtotal: 3.0 },
    ],
    total: 22.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'o2', tableId: 't3', tableNumber: 3, status: 'open',
    items: [
      { id: 'oi3', productId: 'p2', productName: 'Negroni', price: 11.0, quantity: 2, subtotal: 22.0 },
      { id: 'oi4', productId: 'p9', productName: 'Nachos', price: 8.0, quantity: 1, subtotal: 8.0 },
    ],
    total: 30.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'o3', tableId: 't7', tableNumber: 7, status: 'open',
    items: [
      { id: 'oi5', productId: 'p7', productName: 'Whiskey Sour', price: 12.0, quantity: 3, subtotal: 36.0 },
    ],
    total: 36.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
]

// ─── Stock Movements ─────────────────────────────────────────────────────────
export const MOCK_MOVEMENTS: StockMovement[] = [
  { id: 'm1', ingredientId: 'i1', ingredientName: 'White Rum', type: 'IN', quantity: 6000, unit: 'ml', reason: 'Weekly delivery', createdBy: 'admin', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'm2', ingredientId: 'i4', ingredientName: 'Bourbon Whiskey', type: 'LOSS', quantity: 200, unit: 'ml', reason: 'Bottle broken', createdBy: 'bartender1', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'm3', ingredientId: 'i11', ingredientName: 'Prosecco', type: 'IN', quantity: 3000, unit: 'ml', reason: 'Restock', createdBy: 'admin', createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 'm4', ingredientId: 'i8', ingredientName: 'Mint Leaves', type: 'OUT', quantity: 50, unit: 'g', reason: 'Expired', createdBy: 'bartender1', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'm5', ingredientId: 'i3', ingredientName: 'Aperol', type: 'ADJUSTMENT', quantity: 150, unit: 'ml', reason: 'Inventory count correction', createdBy: 'admin', createdAt: new Date().toISOString() },
]

// ─── Reports ─────────────────────────────────────────────────────────────────
export const MOCK_DAILY_SALES: DailySales[] = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - 86400000 * (13 - i)).toISOString().slice(0, 10),
  total: Math.round((Math.random() * 800 + 200) * 100) / 100,
  orderCount: Math.floor(Math.random() * 40 + 10),
}))

export const MOCK_TOP_PRODUCTS: TopProduct[] = [
  { productId: 'p1', productName: 'Mojito', quantity: 142, revenue: 1349.0 },
  { productId: 'p6', productName: 'Gin & Tonic', quantity: 98, revenue: 980.0 },
  { productId: 'p2', productName: 'Negroni', quantity: 87, revenue: 957.0 },
  { productId: 'p4', productName: 'IPA Craft Beer', quantity: 210, revenue: 1260.0 },
  { productId: 'p7', productName: 'Whiskey Sour', quantity: 65, revenue: 780.0 },
]

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
