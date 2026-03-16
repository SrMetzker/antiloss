import { Router } from 'express'
import { createRecipe } from './controllers/CreateRecipeController'
import { getRecipe } from './controllers/GetRecipeController'
import { updateRecipe } from './controllers/UpdateRecipeController'
import { deleteRecipe } from './controllers/DeleteRecipeController'
import {
	authorizeRoles,
	enforceProductAccessFromBody,
	enforceRecipeAccessByProductParam
} from '../../middleware/authorization'

const router = Router()

// CRUD de receitas por produto
router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'CHEF'), enforceProductAccessFromBody('productId'), createRecipe)
router.get('/:productId', authorizeRoles('ADMIN', 'MANAGER', 'CHEF'), enforceRecipeAccessByProductParam('productId'), getRecipe)
router.put('/:productId', authorizeRoles('ADMIN', 'MANAGER', 'CHEF'), enforceRecipeAccessByProductParam('productId'), updateRecipe)
router.delete('/:productId', authorizeRoles('ADMIN', 'MANAGER', 'CHEF'), enforceRecipeAccessByProductParam('productId'), deleteRecipe)

export default router