import { Router } from 'express'
import { createTable } from './controllers/CreateTableController'
import { getTables } from './controllers/GetTablesController'
import { createOrder } from './controllers/CreateOrderController'
import { getOrders } from './controllers/GetOrdersController'
import { closeOrder } from './controllers/CloseOrderController'
import { getKitchenOrders } from './controllers/GetKitchenOrdersController'
import {
	authorizeRoles,
	enforceEstablishmentScope,
	enforceOrderAccessFromParam,
	enforceTableAccessFromBody,
	enforceTableAccessFromQuery
} from '../../middleware/authorization'

const router = Router()

router.get('/tables', authorizeRoles('ADMIN', 'MANAGER', 'BARTENDER', 'CHEF'), enforceEstablishmentScope('query'), getTables)
router.post('/tables', authorizeRoles('ADMIN', 'MANAGER', 'BARTENDER'), enforceEstablishmentScope('body'), createTable)

router.get('/', authorizeRoles('ADMIN', 'MANAGER', 'BARTENDER', 'CHEF'), enforceEstablishmentScope('query'), enforceTableAccessFromQuery('tableId'), getOrders)
router.get('/kitchen', authorizeRoles('ADMIN', 'MANAGER', 'CHEF'), enforceEstablishmentScope('query'), getKitchenOrders)
router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'BARTENDER'), enforceTableAccessFromBody('tableId'), createOrder)
router.patch('/:id/close', authorizeRoles('ADMIN', 'MANAGER', 'BARTENDER'), enforceOrderAccessFromParam('id'), closeOrder)

export default router
