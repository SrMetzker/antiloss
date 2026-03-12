import { Router } from 'express'
import { getProducts } from './controllers/GetProductsController'
import { createProduct } from './controllers/CreateProductController'
import { searchProducts } from './controllers/SearchProductsController'
import { updateProduct } from './controllers/UpdateProductController'
import { deleteProduct } from './controllers/DeleteProductController'
import {
	authorizeRoles,
	enforceEstablishmentScope,
	enforceProductAccessFromParam
} from '../../middleware/authorization'

const router = Router()

router.get('/', authorizeRoles('ADMIN', 'MANAGER', 'BARTENDER', 'CHEF'), enforceEstablishmentScope('query'), getProducts)
router.get('/search', authorizeRoles('ADMIN', 'MANAGER', 'BARTENDER', 'CHEF'), enforceEstablishmentScope('query'), searchProducts)
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), enforceEstablishmentScope('body'), createProduct)
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), enforceProductAccessFromParam('id'), updateProduct)
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), enforceProductAccessFromParam('id'), deleteProduct)

export default router
