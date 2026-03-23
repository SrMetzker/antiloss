# Stratto — Backend

API REST para o sistema de gestão de bares e restaurantes. Construída com Node.js + Express + Prisma ORM + PostgreSQL.

## 🛠 Tech Stack

| Camada      | Tecnologia                    |
|-------------|-------------------------------|
| Runtime     | Node.js 18+                   |
| Framework   | Express 5                     |
| ORM         | Prisma 7 (driver `pg`)        |
| Banco       | PostgreSQL                    |
| Auth        | JWT (`jsonwebtoken`)          |
| Senhas      | bcryptjs                      |
| Linguagem   | TypeScript                    |

## 🚀 Iniciando

```bash
# 1. Instalar dependências (da raiz do monorepo)
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com DATABASE_URL e JWT_SECRET

# 3. Rodar migrations
npx prisma migrate deploy --schema prisma/schema.prisma

# 4. Seed de desenvolvimento (opcional)
npm run seed:dev

# 5. Iniciar em modo watch
npm run dev
```

Servidor disponível em `http://localhost:3000` (padrão).

## ⚙️ Variáveis de Ambiente

| Variável       | Descrição                                  |
|----------------|--------------------------------------------|
| `DATABASE_URL` | Connection string PostgreSQL               |
| `JWT_SECRET`   | Chave secreta para assinar tokens JWT      |
| `PORT`         | Porta do servidor (padrão: `3000`)         |

## 🔐 Autenticação & RBAC

Todas as rotas (exceto `/users/login` e `/users/register`) exigem header:

```
Authorization: Bearer <token>
```

### Roles disponíveis

| Role        | Permissões                                      |
|-------------|------------------------------------------------|
| `ADMIN`     | Acesso total, gerenciamento de usuários        |
| `MANAGER`   | Operações de produtos, estoque, relatórios     |
| `BARTENDER` | Pedidos e consulta de mesas                   |
| `CHEF`      | Visualização da fila de cozinha               |

### Middleware de Assinatura

Todas as rotas protegidas também passam por `ensureSubscriptionAccess`, que verifica se o estabelecimento tem uma assinatura ativa e se os limites do plano (usuários, produtos, mesas) não foram excedidos.

## 📡 Rotas da API

### Usuários — `/users`

| Método | Rota             | Auth | Descrição                        |
|--------|------------------|------|----------------------------------|
| POST   | `/users/login`   | ❌   | Login, retorna JWT               |
| POST   | `/users/register`| ❌   | Cadastro de novo usuário         |
| GET    | `/users`         | ✅   | Listar usuários do estabelecimento |
| PATCH  | `/users/:id`     | ✅   | Atualizar dados do usuário       |
| DELETE | `/users/:id`     | ✅   | Remover usuário                  |

### Estabelecimentos — `/establishments`

| Método | Rota                      | Auth | Descrição                    |
|--------|---------------------------|------|------------------------------|
| GET    | `/establishments`         | ✅   | Listar estabelecimentos do usuário |
| POST   | `/establishments`         | ✅   | Criar estabelecimento        |
| PATCH  | `/establishments/:id`     | ✅   | Atualizar estabelecimento    |
| DELETE | `/establishments/:id`     | ✅   | Remover estabelecimento      |

### Produtos — `/products`

| Método | Rota              | Auth | Descrição              |
|--------|-------------------|------|------------------------|
| GET    | `/products`       | ✅   | Listar produtos        |
| POST   | `/products`       | ✅   | Criar produto          |
| PATCH  | `/products/:id`   | ✅   | Atualizar produto      |
| DELETE | `/products/:id`   | ✅   | Remover produto        |

### Receitas — `/recipes`

| Método | Rota            | Auth | Descrição                                |
|--------|-----------------|------|------------------------------------------|
| GET    | `/recipes`      | ✅   | Listar receitas com itens e ingredientes |
| POST   | `/recipes`      | ✅   | Criar receita para um produto            |
| PATCH  | `/recipes/:id`  | ✅   | Atualizar receita                        |
| DELETE | `/recipes/:id`  | ✅   | Remover receita                          |

### Estoque — `/stock`

| Método | Rota                   | Auth | Descrição                                      |
|--------|------------------------|------|------------------------------------------------|
| GET    | `/stock/ingredients`   | ✅   | Listar ingredientes com quantidade atual       |
| POST   | `/stock/ingredients`   | ✅   | Criar ingrediente                              |
| PATCH  | `/stock/ingredients/:id`| ✅  | Atualizar ingrediente                          |
| GET    | `/stock/movements`     | ✅   | Listar movimentações de estoque                |
| POST   | `/stock/movements`     | ✅   | Registrar movimentação (IN/OUT/LOSS/ADJUSTMENT)|

### Pedidos — `/orders`

| Método | Rota                        | Auth | Descrição                         |
|--------|-----------------------------|------|-----------------------------------|
| GET    | `/orders`                   | ✅   | Listar pedidos do estabelecimento |
| GET    | `/orders/kitchen`           | ✅   | Fila de pedidos para cozinha      |
| GET    | `/orders/table/:tableId`    | ✅   | Pedido aberto de uma mesa         |
| POST   | `/orders`                   | ✅   | Criar pedido                      |
| PATCH  | `/orders/:id`               | ✅   | Atualizar status / fechar pedido  |
| POST   | `/orders/:id/items`         | ✅   | Adicionar item ao pedido          |
| DELETE | `/orders/:id/items/:itemId` | ✅   | Remover item do pedido            |

## 🗄 Modelos do Banco

```
User           — Usuários com role (ADMIN/MANAGER/BARTENDER/CHEF)
Establishment  — Estabelecimentos (N:N com User via EstablishmentUser)
Product        — Produtos com categoria e preço
Recipe         — Receita de um produto (1:1)
RecipeItem     — Ingrediente + quantidade por receita
Ingredient     — Ingrediente com currentStock e minimumStock
StockMovement  — Movimentação de estoque (produto ou ingrediente)
Table          — Mesa com capacidade e flag de reserva
Order          — Pedido vinculado a uma mesa
OrderItem      — Item de pedido (produto + quantidade + preço)
Plan           — Planos de assinatura com limites
Subscription   — Assinatura de um estabelecimento a um plano
```

## 🏗 Estrutura do Código

```
src/
├── server.ts              # Entry point — Express app e registro de rotas
├── database.ts            # Conexão Prisma
├── features/              # Domínios de negócio
│   ├── establishments/    # routes + controllers + services
│   ├── products/
│   ├── recipes/
│   ├── stock/
│   ├── orders/
│   └── users/
├── middleware/
│   ├── auth.ts            # Verificação e extração do JWT
│   ├── authorization.ts   # Verificação de role (RBAC)
│   ├── subscription.ts    # Verificação de assinatura e limites de plano
│   └── errorHandler.ts    # Handler global de erros
├── utils/
│   ├── errors.ts          # Classes de erro HTTP customizadas
│   └── planLimits.ts      # Helpers de limites por plano
├── scripts/
│   └── seed-dev.ts        # Seed de dados para desenvolvimento
└── generated/             # Tipos gerados pelo Prisma Client
```

## 📜 Scripts

| Script                  | Descrição                                        |
|-------------------------|--------------------------------------------------|
| `npm run dev`           | Iniciar em modo watch com `ts-node-dev`          |
| `npm run build`         | Compilar TypeScript para `dist/`                 |
| `npm run start:prod`    | Executar build de produção                        |
| `npm run migrate:deploy`| Aplicar migrations no banco (`prisma migrate deploy`) |
| `npm run seed:dev`      | Popular banco com dados de desenvolvimento       |