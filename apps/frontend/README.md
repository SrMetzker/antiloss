# Stratto — Frontend

SPA mobile-first para gestão de bares e restaurantes, construída com React + Vite + TypeScript.

## ✨ Funcionalidades

- 🔐 **Autenticação JWT** — Login/cadastro com token em localStorage + interceptor Axios automático
- 🏢 **Multi-estabelecimento** — Troca de estabelecimento ativo na sidebar; todos os dados são filtrados e recarregados automaticamente
- 👥 **RBAC** — Controle de acesso por role (`ADMIN`, `MANAGER`, `BARTENDER`, `CHEF`)
- 📊 **Dashboard** — Cards de vendas do dia, pedidos, ticket médio, produtos sem receita e ingredientes em baixo estoque (com alerta de severidade)
- 🍽️ **Mesas & Pedidos** — Mapa visual de mesas, abertura/fechamento de pedidos, edição de itens em tempo real
- 👨‍🍳 **Cozinha** — Fila de pedidos pendentes para a equipe de cozinha
- 📦 **Produtos** — CRUD completo com busca e filtro por categoria
- 🍹 **Receitas** — Definição de ingredientes e quantidades por produto
- 📋 **Estoque** — Movimentações (Entrada/Saída/Perda/Ajuste), níveis com barra visual
- 📈 **Relatórios** — Gráficos de vendas, volume de pedidos, top produtos, perdas de estoque
- 👤 **Usuários** — Gerenciamento de usuários e permissões
- 💳 **Assinatura** — Visualização de plano e limites de uso

## 🛠 Tech Stack

| Camada         | Tecnologia                          |
|----------------|-------------------------------------|
| UI Framework   | React 18 + TypeScript               |
| Build Tool     | Vite 5                              |
| Roteamento     | React Router v6                     |
| Server State   | TanStack Query v5                   |
| HTTP Client    | Axios (com interceptor JWT)         |
| Global State   | Zustand                             |
| Estilização    | TailwindCSS                         |
| Gráficos       | Recharts                            |
| Ícones         | Lucide React                        |

## 🚀 Iniciando

```bash
# 1. Instalar dependências (da raiz do monorepo)
npm install

# 2. Copiar variáveis de ambiente
cp .env.example .env
# Editar .env: definir VITE_API_URL=http://localhost:3000

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173)

## 📁 Estrutura

```
src/
├── api/                  # Funções de chamada à API
│   ├── client.ts         # Instância Axios com interceptor JWT e redirect 401
│   ├── auth.ts
│   ├── establishments.ts
│   ├── products.ts
│   ├── orders.ts
│   ├── inventory.ts
│   ├── recipes.ts
│   ├── reports.ts        # Agregação client-side de relatórios
│   ├── subscription.ts
│   └── users.ts
├── components/
│   ├── ui/               # Componentes reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx     # + Select, Textarea
│   │   ├── Modal.tsx     # Suporta headerActions (slot para botões no cabeçalho)
│   │   ├── Card.tsx      # + Badge, StatCard (com prop severity), EmptyState, ErrorState
│   │   └── Toast.tsx
│   └── layout/           # Shell da aplicação
│       ├── Layout.tsx
│       ├── Sidebar.tsx   # Collapsible + seletor de estabelecimento
│       ├── Navbar.tsx    # Topbar mobile
│       └── BottomNav.tsx # Navegação inferior mobile
├── hooks/
│   └── index.ts          # Hooks TanStack Query (todos escopados por estabelecimento ativo)
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── TablesPage.tsx
│   ├── KitchenPage.tsx
│   ├── ProductsPage.tsx
│   ├── RecipesPage.tsx
│   ├── InventoryPage.tsx
│   ├── ReportsPage.tsx
│   ├── UsersPage.tsx
│   ├── EstablishmentsPage.tsx
│   └── SubscriptionPage.tsx
├── store/
│   ├── authStore.ts      # Zustand: token JWT + estabelecimento ativo
│   └── toastStore.ts     # Notificações globais
├── types/
│   └── index.ts          # Tipos TypeScript da aplicação
└── utils/
    ├── format.ts         # Formatadores de moeda, data (timezone-safe) e labels
    ├── rbac.ts           # Helpers de verificação de role
    └── mockData.ts       # Dados mock para desenvolvimento offline
```

## 🎨 Design System

- **Fontes**: Outfit (títulos) + DM Sans (corpo)
- **Tema**: Dark — fundo carvão com acentos âmbar/dourado
- **Tokens de cor** definidos em `tailwind.config.js` nos namespaces `bg.*` e `brand.*`
- **StatCard**: suporta prop `severity` (`default` | `warning` | `danger`) para feedback visual de alertas

## 📱 UX Mobile

- Layout mobile-first com navegação inferior
- Touch targets mínimos de 44px
- Modais responsivos
- Sem overflow horizontal

## 🏗️ Build para Produção

```bash
npm run build
```

Saída em `dist/` — servir com qualquer host estático (Vercel, Netlify, Nginx).
