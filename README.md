# Stratto — Sistema de Gestão para Bares e Restaurantes

Monorepo (npm workspaces) com frontend React e backend Node.js/Express para gestão completa de estabelecimentos gastronômicos. Foco em controle de perdas, estoque e operação de salão.

## 📦 Estrutura do Monorepo

```
anti-loss/
├── apps/
│   ├── frontend/   # React + Vite + TypeScript
│   └── backend/    # Node.js + Express + Prisma + PostgreSQL
└── package.json    # Workspace root (npm workspaces)
```

Cada app tem seu próprio README com detalhes técnicos:

- [Frontend →](apps/frontend/README.md)
- [Backend →](apps/backend/readme.md)

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- PostgreSQL (instância local ou Docker)

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Editar apps/backend/.env: DATABASE_URL e JWT_SECRET

# Frontend
cp apps/frontend/.env.example apps/frontend/.env
# Editar apps/frontend/.env: VITE_API_URL=http://localhost:3000
```

### 3. Banco de dados

```bash
# Rodar migrations
npx prisma migrate deploy --schema apps/backend/prisma/schema.prisma

# Seed de desenvolvimento (cria usuário admin + dados de exemplo)
npm run -w apps/backend seed:dev
```

### 4. Iniciar em desenvolvimento

Abra dois terminais:

```bash
# Terminal 1 — Backend (porta 3000)
npm run dev:backend

# Terminal 2 — Frontend (porta 5173)
npm run dev:frontend
```

| Serviço     | URL padrão              |
|-------------|-------------------------|
| Frontend    | http://localhost:5173   |
| Backend API | http://localhost:3000   |

## 🗂 Scripts do workspace raiz

| Script              | Descrição                        |
|---------------------|----------------------------------|
| `npm run dev:backend`  | Inicia o backend em modo watch  |
| `npm run dev:frontend` | Inicia o frontend via Vite      |

## 🏗 Arquitetura

```
Frontend (React SPA)
    ↕ HTTP (JWT Bearer)
Backend (Express REST API)
    ↕ Prisma ORM
PostgreSQL
```

- **Autenticação**: JWT (access token via header Authorization)
- **RBAC**: Roles `ADMIN | MANAGER | BARTENDER | CHEF`
- **Multi-estabelecimento**: Um usuário pode gerenciar múltiplos estabelecimentos; dados são sempre filtrados pelo estabelecimento ativo
- **Assinaturas**: middleware de verificação de plano em todas as rotas protegidas

## 📋 Funcionalidades Principais

| Módulo            | Descrição |
|-------------------|-----------|
| Dashboard         | Cards de vendas, pedidos, ticket médio, produtos sem receita, ingredientes em baixo estoque |
| Mesas & Pedidos   | Mapa visual de mesas, abertura/fechamento de pedidos, adição de itens |
| Cozinha           | Fila de pedidos em tempo real para a equipe de cozinha |
| Produtos          | CRUD completo com filtro por categoria |
| Receitas          | Definição de ingredientes por produto |
| Estoque           | Movimentações (Entrada/Saída/Perda/Ajuste), níveis de estoque com alerta visual |
| Relatórios        | Gráficos de vendas, volume de pedidos, top produtos, perdas |
| Usuários          | Gerenciamento de usuários com controle de acesso por role |
| Estabelecimentos  | Criação e troca de estabelecimentos pelo mesmo usuário |
| Assinatura        | Página de plano e limites de uso |
