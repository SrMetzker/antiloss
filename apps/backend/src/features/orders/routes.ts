import { Router } from 'express'
import { createTable } from './controllers/CreateTableController'
import { getTables } from './controllers/GetTablesController'
import { createOrder } from './controllers/CreateOrderController'
import { getOrders } from './controllers/GetOrdersController'
import { closeOrder } from './controllers/CloseOrderController'
import { addOrderItem } from './controllers/AddOrderItemController'
import { removeOrderItem } from './controllers/RemoveOrderItemController'
import { getKitchenOrders } from './controllers/GetKitchenOrdersController'
import { updateTable } from './controllers/UpdateTableController'
import {
	authorizeRoles,
	enforceEstablishmentScope,
	enforceOrderAccessFromParam,
	enforceTableAccessFromBody,
	enforceTableAccessFromQuery
} from '../../middleware/authorization'

const router = Router()

router.get('/tables', authorizeRoles('ADMIN', 'MANAGER', 'BARTENDER'), enforceEstablishmentScope('query'), getTables)
router.post('/tables', authorizeRoles('ADMIN', 'MANAGER', 'BARTENDER'), enforceEstablishmentScope('body'), createTable)
router.patch('/tables/:id', authorizeRoles('ADMIN', 'MANAGER', 'BARTENDER'), enforceEstablishmentScope('body'), updateTable)

router.get('/', authorizeRoles('ADMIN', 'MANAGER', 'BARTENDER'), enforceEstablishmentScope('query'), enforceTableAccessFromQuery('tableId'), getOrders)
router.get('/kitchen', authorizeRoles('ADMIN', 'MANAGER', 'CHEF'), enforceEstablishmentScope('query'), getKitchenOrders)
router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'BARTENDER'), enforceTableAccessFromBody('tableId'), createOrder)
router.post('/:id/items', authorizeRoles('ADMIN', 'MANAGER', 'BARTENDER'), enforceOrderAccessFromParam('id'), addOrderItem)
router.delete('/:id/items/:itemId', authorizeRoles('ADMIN', 'MANAGER', 'BARTENDER'), enforceOrderAccessFromParam('id'), removeOrderItem)
router.patch('/:id/close', authorizeRoles('ADMIN', 'MANAGER', 'BARTENDER'), enforceOrderAccessFromParam('id'), closeOrder)

export default router
