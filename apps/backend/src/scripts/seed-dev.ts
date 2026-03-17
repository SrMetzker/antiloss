import bcrypt from 'bcryptjs'
import { prisma } from '../config/database'

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10)

  const starterPlan = await prisma.plan.create({
    data: {
      code: 'starter',
      name: 'Iniciante',
      description: 'Plano inicial para operacao basica',
      priceCents: 1490,
      currency: 'EUR',
      billingCycle: 'MONTHLY',
      trialDays: 14,
      maxUsers: 3,
      maxProducts: 50,
      maxTables: 4
    }
  })

  await prisma.plan.create({
    data: {
      code: 'pro',
      name: 'Profissional',
      description: 'Plano para bares e restaurantes em crescimento',
      priceCents: 3490,
      currency: 'EUR',
      billingCycle: 'MONTHLY',
      trialDays: 14,
      maxUsers: 10,
      maxProducts: 200,
      maxTables: 15
    }
  })

  const admin = await prisma.user.create({
    data: {
      email: 'admin@anti-loss.com',
      password: passwordHash,
      name: 'Admin Sistema',
      role: 'ADMIN',
      createdBy: 'system'
    }
  })

  const manager = await prisma.user.create({
    data: {
      email: 'manager@anti-loss.com',
      password: passwordHash,
      name: 'Gerente Principal',
      role: 'MANAGER',
      createdBy: admin.id
    }
  })

  const bartender = await prisma.user.create({
    data: {
      email: 'bartender@anti-loss.com',
      password: passwordHash,
      name: 'Bartender Demo',
      role: 'BARTENDER',
      createdBy: admin.id
    }
  })

  const chef = await prisma.user.create({
    data: {
      email: 'chef@anti-loss.com',
      password: passwordHash,
      name: 'Chef Demo',
      role: 'CHEF',
      createdBy: admin.id
    }
  })

  const est1 = await prisma.establishment.create({
    data: {
      name: 'Bar Central',
      createdBy: admin.id
    }
  })

  const est2 = await prisma.establishment.create({
    data: {
      name: 'Bar Jardim',
      createdBy: admin.id
    }
  })

  const trialStart = new Date()
  const trialEnd = new Date(trialStart)
  trialEnd.setDate(trialEnd.getDate() + 14)

  await prisma.subscription.createMany({
    data: [
      {
        establishmentId: est1.id,
        planId: starterPlan.id,
        status: 'TRIAL',
        startedAt: trialStart,
        trialEndsAt: trialEnd,
        currentPeriodStart: trialStart,
        currentPeriodEnd: trialEnd
      },
      {
        establishmentId: est2.id,
        planId: starterPlan.id,
        status: 'TRIAL',
        startedAt: trialStart,
        trialEndsAt: trialEnd,
        currentPeriodStart: trialStart,
        currentPeriodEnd: trialEnd
      }
    ]
  })

  await prisma.establishmentUser.createMany({
    data: [
      { userId: admin.id, establishmentId: est1.id },
      { userId: admin.id, establishmentId: est2.id },
      { userId: manager.id, establishmentId: est1.id },
      { userId: bartender.id, establishmentId: est1.id },
      { userId: chef.id, establishmentId: est1.id },
      { userId: manager.id, establishmentId: est2.id }
    ],
    skipDuplicates: true
  })

  const table1 = await prisma.table.create({
    data: { number: 1, establishmentId: est1.id }
  })
  const table2 = await prisma.table.create({
    data: { number: 2, establishmentId: est1.id }
  })
  await prisma.table.create({
    data: { number: 3, establishmentId: est1.id }
  })

  const rum = await prisma.ingredient.create({
    data: {
      name: 'Rum Branco',
      unit: 'ML',
      currentStock: 5000,
      minimumStock: 1000,
      establishmentId: est1.id,
      createdBy: admin.id
    }
  })

  const lime = await prisma.ingredient.create({
    data: {
      name: 'Suco de Limao',
      unit: 'ML',
      currentStock: 3000,
      minimumStock: 600,
      establishmentId: est1.id,
      createdBy: admin.id
    }
  })

  const sugar = await prisma.ingredient.create({
    data: {
      name: 'Xarope de Acucar',
      unit: 'ML',
      currentStock: 2500,
      minimumStock: 500,
      establishmentId: est1.id,
      createdBy: admin.id
    }
  })

  const mint = await prisma.ingredient.create({
    data: {
      name: 'Hortela',
      unit: 'UNIT',
      currentStock: 200,
      minimumStock: 40,
      establishmentId: est1.id,
      createdBy: admin.id
    }
  })

  const ice = await prisma.ingredient.create({
    data: {
      name: 'Gelo',
      unit: 'KG',
      currentStock: 80,
      minimumStock: 20,
      establishmentId: est1.id,
      createdBy: admin.id
    }
  })

  const mojito = await prisma.product.create({
    data: {
      name: 'Mojito',
      sku: 'DRK-001',
      price: 29.9,
      establishmentId: est1.id,
      createdBy: admin.id
    }
  })

  const caipirinha = await prisma.product.create({
    data: {
      name: 'Caipirinha',
      sku: 'DRK-002',
      price: 24.9,
      establishmentId: est1.id,
      createdBy: admin.id
    }
  })

  const ginTonic = await prisma.product.create({
    data: {
      name: 'Gin Tonic',
      sku: 'DRK-003',
      price: 32.5,
      establishmentId: est1.id,
      createdBy: admin.id
    }
  })

  const est2Beer = await prisma.product.create({
    data: {
      name: 'Cerveja Lager',
      sku: 'BRJ-001',
      price: 15,
      establishmentId: est2.id,
      createdBy: admin.id
    }
  })

  const mojitoRecipe = await prisma.recipe.create({
    data: {
      productId: mojito.id,
      createdBy: chef.id
    }
  })

  await prisma.recipeItem.createMany({
    data: [
      { recipeId: mojitoRecipe.id, ingredientId: rum.id, quantity: 50 },
      { recipeId: mojitoRecipe.id, ingredientId: lime.id, quantity: 30 },
      { recipeId: mojitoRecipe.id, ingredientId: sugar.id, quantity: 20 },
      { recipeId: mojitoRecipe.id, ingredientId: mint.id, quantity: 6 },
      { recipeId: mojitoRecipe.id, ingredientId: ice.id, quantity: 0.2 }
    ]
  })

  const caipiRecipe = await prisma.recipe.create({
    data: {
      productId: caipirinha.id,
      createdBy: chef.id
    }
  })

  await prisma.recipeItem.createMany({
    data: [
      { recipeId: caipiRecipe.id, ingredientId: lime.id, quantity: 35 },
      { recipeId: caipiRecipe.id, ingredientId: sugar.id, quantity: 25 },
      { recipeId: caipiRecipe.id, ingredientId: ice.id, quantity: 0.2 }
    ]
  })

  const ginRecipe = await prisma.recipe.create({
    data: {
      productId: ginTonic.id,
      createdBy: chef.id
    }
  })

  await prisma.recipeItem.createMany({
    data: [
      { recipeId: ginRecipe.id, ingredientId: ice.id, quantity: 0.25 },
      { recipeId: ginRecipe.id, ingredientId: lime.id, quantity: 10 }
    ]
  })

  const closedOrder = await prisma.order.create({
    data: {
      tableId: table1.id,
      status: 'CLOSED',
      total: 84.7
    }
  })

  await prisma.orderItem.createMany({
    data: [
      { orderId: closedOrder.id, productId: mojito.id, quantity: 2, price: 29.9 },
      { orderId: closedOrder.id, productId: caipirinha.id, quantity: 1, price: 24.9 }
    ]
  })

  const openOrder = await prisma.order.create({
    data: {
      tableId: table2.id,
      status: 'OPEN',
      total: 62.4
    }
  })

  await prisma.orderItem.createMany({
    data: [
      { orderId: openOrder.id, productId: ginTonic.id, quantity: 1, price: 32.5 },
      { orderId: openOrder.id, productId: mojito.id, quantity: 1, price: 29.9 }
    ]
  })

  await prisma.stockMovement.createMany({
    data: [
      { ingredientId: rum.id, type: 'IN', quantity: 5000, note: 'Estoque inicial', createdBy: admin.id },
      { ingredientId: lime.id, type: 'IN', quantity: 3000, note: 'Estoque inicial', createdBy: admin.id },
      { ingredientId: sugar.id, type: 'IN', quantity: 2500, note: 'Estoque inicial', createdBy: admin.id },
      { ingredientId: mint.id, type: 'IN', quantity: 200, note: 'Estoque inicial', createdBy: admin.id },
      { ingredientId: ice.id, type: 'IN', quantity: 80, note: 'Estoque inicial', createdBy: admin.id },
      { productId: est2Beer.id, type: 'IN', quantity: 60, note: 'Entrada inicial', createdBy: admin.id }
    ]
  })

  console.log('Seed concluido com sucesso.')
  console.log('Credenciais:')
  console.log('admin@anti-loss.com / 123456')
  console.log('manager@anti-loss.com / 123456')
  console.log('bartender@anti-loss.com / 123456')
  console.log('chef@anti-loss.com / 123456')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
