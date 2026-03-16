import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler'
import { authenticateToken } from './middleware/auth'
import establishmentsRoutes from './features/establishments/routes'
import productsRoutes from './features/products/routes'
import usersRoutes from './features/users/routes'
import stockRoutes from './features/stock/routes'
import ordersRoutes from './features/orders/routes'
import recipesRoutes from './features/recipes/routes'

const port: number = Number(process.env.PORT) || 3000;
const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Routes
app.use('/establishments', authenticateToken, establishmentsRoutes)
app.use('/products', authenticateToken, productsRoutes)
app.use('/stock', authenticateToken, stockRoutes)
app.use('/orders', authenticateToken, ordersRoutes)
app.use('/recipes', authenticateToken, recipesRoutes)
app.use('/users', usersRoutes) // Login não precisa de auth

// Error handling
app.use(errorHandler)

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Não foi possível encontrar a rota solicitada!' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`)
})
