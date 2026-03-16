# BarFlow — Bar & Restaurant Management System

A production-ready, mobile-first frontend for bar/restaurant management built with React + Vite + TypeScript.

## ✨ Features

- 🔐 **JWT Authentication** — Login with token persisted to localStorage + Axios interceptor
- 📊 **Dashboard** — Sales charts, stock alerts, top products, quick actions
- 🍽️ **Tables & Orders** — Visual table map, open/close orders, add/edit items in real-time
- 📦 **Products** — Full CRUD with search, category filter, low-stock badges
- 🍹 **Recipes** — Define ingredient usage per product
- 📋 **Inventory** — Stock movements (IN/OUT/LOSS/ADJUSTMENT), current stock levels with visual bars
- 📈 **Reports** — Sales charts, order volume, top products, stock losses

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Routing | React Router v6 |
| Server State | TanStack Query v5 |
| HTTP Client | Axios (with JWT interceptor) |
| Global State | Zustand |
| Styling | TailwindCSS |
| Charts | Recharts |
| Icons | Lucide React |

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

**Demo credentials:**
- Email: `admin@barflow.com`
- Password: `password`

## 📁 Project Structure

```
src/
├── api/              # API functions (mock or real backend)
│   ├── client.ts     # Axios instance with JWT interceptor
│   ├── auth.ts
│   ├── products.ts
│   ├── orders.ts
│   ├── inventory.ts
│   ├── recipes.ts
│   └── reports.ts
├── components/
│   ├── ui/           # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx (+ Select, Textarea)
│   │   ├── Modal.tsx (+ ConfirmModal)
│   │   ├── Card.tsx  (+ Badge, StatCard, EmptyState, ErrorState)
│   │   └── Toast.tsx
│   └── layout/       # App shell
│       ├── Layout.tsx
│       ├── Sidebar.tsx   (collapsible, desktop)
│       ├── Navbar.tsx    (mobile top bar)
│       └── BottomNav.tsx (mobile bottom nav)
├── hooks/            # TanStack Query hooks
│   └── index.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── TablesPage.tsx
│   ├── ProductsPage.tsx
│   ├── RecipesPage.tsx
│   ├── InventoryPage.tsx
│   └── ReportsPage.tsx
├── store/
│   ├── authStore.ts   # Zustand auth + localStorage persist
│   └── toastStore.ts  # Global toast notifications
├── types/
│   └── index.ts       # All TypeScript types
└── utils/
    ├── format.ts      # Currency, date, label formatters
    └── mockData.ts    # In-memory mock data
```

## 🔌 Connecting to a Real Backend

1. Set `VITE_API_URL=http://your-api.com` in `.env`
2. Replace mock API files in `src/api/` with real Axios calls
3. The Axios client in `src/api/client.ts` already handles JWT headers and 401 redirects

## 🎨 Design System

- **Font**: Outfit (headings) + DM Sans (body)
- **Theme**: Dark — charcoal backgrounds with amber/gold accents
- **Color tokens** defined in `tailwind.config.js` under `bg.*` and `brand.*`

## 📱 Mobile UX

- Mobile-first layout with bottom navigation
- Large touch targets (min 44px)
- Touch-friendly order management
- Bottom sheet modals on mobile
- No horizontal overflow

## 🏗️ Building for Production

```bash
npm run build
```

Output in `dist/` — serve with any static host (Vercel, Netlify, Nginx).
