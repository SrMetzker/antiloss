import { Router } from 'express'
import { getIngredients } from './controllers/GetIngredientsController'
import { createIngredient } from './controllers/CreateIngredientController'
import { updateIngredient } from './controllers/UpdateIngredientController'
import { deleteIngredient } from './controllers/DeleteIngredientController'
import { createRecipe } from './controllers/CreateRecipeController'
import { getRecipeByProduct } from './controllers/GetRecipeByProductController'
import {
	authorizeRoles,
	enforceEstablishmentScope,
	enforceIngredientAccessFromParam,
	enforceProductAccessFromBody,
	enforceRecipeAccessByProductParam
} from '../../middleware/authorization'
import { getStockMovements } from './controllers/GetStockMovementsController'

const router = Router()

router.get('/', authorizeRoles('ADMIN', 'MANAGER', 'CHEF'), enforceEstablishmentScope('query'), getIngredients)
router.get('/movements', authorizeRoles('ADMIN', 'MANAGER', 'CHEF'), enforceEstablishmentScope('query'), getStockMovements)
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), enforceEstablishmentScope('body'), createIngredient)
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), enforceIngredientAccessFromParam('id'), updateIngredient)
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), enforceIngredientAccessFromParam('id'), deleteIngredient)

router.post('/recipes', authorizeRoles('ADMIN', 'MANAGER', 'CHEF'), enforceProductAccessFromBody('productId'), createRecipe)
router.get('/recipes/:productId', authorizeRoles('ADMIN', 'MANAGER', 'CHEF'), enforceRecipeAccessByProductParam('productId'), getRecipeByProduct)

export default router
