import { Router } from 'express'
import { getProducts } from './controllers/GetProductsController'
import { createProduct } from './controllers/CreateProductController'
import { searchProducts } from './controllers/SearchProductsController'
import { updateProduct } from './controllers/UpdateProductController'
import { deleteProduct } from './controllers/DeleteProductController'

const router = Router()

router.get('/', getProducts)
router.get('/search', searchProducts)
router.post('/', createProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

export default router
