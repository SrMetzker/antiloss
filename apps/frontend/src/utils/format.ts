const parseDateInput = (dateString: string): Date => {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString)

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  return new Date(dateString)
}

export const getLocalDateKey = (value: string | Date = new Date()): string => {
  const date = value instanceof Date ? value : parseDateInput(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const shiftDateKey = (dateKey: string, days: number): string => {
  const date = parseDateInput(dateKey)
  date.setDate(date.getDate() + days)
  return getLocalDateKey(date)
}

export const formatCurrency = (amount: number, currency = 'EUR'): string => {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-IE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parseDateInput(dateString))
}

export const formatTime = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-IE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(parseDateInput(dateString))
}

export const formatDateTime = (dateString: string): string => {
  return `${formatDate(dateString)} ${formatTime(dateString)}`
}

export const formatRelativeTime = (dateString: string): string => {
  const diff = Date.now() - parseDateInput(dateString).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export const formatShortDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-IE', {
    day: '2-digit',
    month: 'short',
  }).format(parseDateInput(dateString))
}

export const slugify = (text: string): string =>
  text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

export const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1)

export const categoryLabel = (cat: string): string => {
  const map: Record<string, string> = {
    spirits: 'Spirits',
    beer: 'Beer',
    wine: 'Wine',
    cocktails: 'Cocktails',
    soft_drinks: 'Soft Drinks',
    food: 'Food',
    other: 'Other',
  }
  return map[cat] ?? capitalize(cat)
}

export const movementLabel = (type: string): string => {
  const map: Record<string, string> = {
    IN: 'Stock In',
    OUT: 'Stock Out',
    SALE: 'Sale',
    LOSS: 'Loss',
    ADJUSTMENT: 'Adjustment',
  }
  return map[type] ?? type
}

export const movementColor = (type: string): string => {
  const map: Record<string, string> = {
    IN: 'badge-green',
    OUT: 'badge-blue',
    SALE: 'badge-blue',
    LOSS: 'badge-red',
    ADJUSTMENT: 'badge-amber',
  }
  return map[type] ?? 'badge-amber'
}
