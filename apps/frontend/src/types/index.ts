// ─── Auth ────────────────────────────────────────────────────────────────────
export interface Establishment {
  id: string
  name: string
  createdAt: string
  createdBy: string
}

export interface UserEstablishmentLink {
  id: string
  userId: string
  establishmentId: string
  establishment?: Establishment
}

export interface User {
  id: string
  name: string
  email: string
  role?: 'admin' | 'bartender' | 'manager' | 'chef'
  createdAt?: string
  createdBy?: string
  establishments?: UserEstablishmentLink[]
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  expiresIn?: string
}

// ─── Products ────────────────────────────────────────────────────────────────
export type ProductCategory =
  | 'spirits'
  | 'beer'
  | 'wine'
  | 'cocktails'
  | 'soft_drinks'
  | 'food'
  | 'other'

export interface Product {
  id: string
  name: string
  price: number
  sku: string
  category: ProductCategory
  establishmentId?: string
  stock?: number
  lowStockThreshold?: number
  image?: string
  createdAt: string
  updatedAt: string
}

export interface ProductFormData {
  name: string
  price: number
  sku: string
  category: ProductCategory
  lowStockThreshold?: number
}

// ─── Ingredients / Inventory ─────────────────────────────────────────────────
export type MovementType = 'IN' | 'OUT' | 'SALE' | 'LOSS' | 'ADJUSTMENT'

export type StockUnit = 'ml' | 'cl' | 'l' | 'g' | 'kg' | 'unit' | 'bottle'

export interface Ingredient {
  id: string
  name: string
  unit: StockUnit
  currentStock: number
  minStock: number
  establishmentId?: string
  costPerUnit: number
  category: string
}

export interface StockMovement {
  id: string
  ingredientId: string
  ingredientName: string
  type: MovementType
  quantity: number
  unit: StockUnit
  reason?: string
  createdBy: string
  createdAt: string
}

export interface StockMovementFormData {
  ingredientId: string
  type: MovementType
  quantity: number
  reason?: string
}

// ─── Recipes ─────────────────────────────────────────────────────────────────
export interface RecipeIngredient {
  ingredientId: string
  ingredientName: string
  quantity: number
  unit: StockUnit
}

export interface Recipe {
  id: string
  productId: string
  productName: string
  instructions?: string
  ingredients: RecipeIngredient[]
  createdAt: string
  updatedAt: string
}

export interface RecipeFormData {
  productId: string
  instructions?: string
  ingredients: RecipeIngredient[]
}

// ─── Orders / Tables ─────────────────────────────────────────────────────────
export type OrderStatus = 'open' | 'closed' | 'cancelled'
export type TableStatus = 'free' | 'occupied' | 'reserved'

export interface OrderItem {
  id: string
  productId: string
  productName: string
  price: number
  quantity: number
  subtotal: number
}

export interface Order {
  id: string
  tableId: string
  tableNumber: number
  status: OrderStatus
  items: OrderItem[]
  total: number
  createdAt: string
  updatedAt: string
  closedAt?: string
}

export interface Table {
  id: string
  number: number
  establishmentId?: string
  capacity: number
  status: TableStatus
  activeOrderId?: string
}

export interface TableCreateInput {
  number: number
}

export interface UserCreateInput {
  name: string
  email: string
  password: string
}

export interface UserUpdateInput {
  name?: string
  email?: string
  password?: string
}

export interface EstablishmentCreateInput {
  name: string
}

export interface EstablishmentUpdateInput {
  name: string
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export interface DailySales {
  date: string
  total: number
  orderCount: number
}

export interface TopProduct {
  productId: string
  productName: string
  quantity: number
  revenue: number
}

export interface StockLoss {
  ingredientId: string
  ingredientName: string
  quantity: number
  unit: StockUnit
  date: string
}

export interface ReportSummary {
  dailySales: DailySales[]
  topProducts: TopProduct[]
  stockLosses: StockLoss[]
  totalRevenue: number
  totalOrders: number
}

// ─── Shared ───────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface ApiError {
  message: string
  statusCode: number
}

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
}
