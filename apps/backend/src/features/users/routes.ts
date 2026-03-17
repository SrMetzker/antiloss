import { Router } from 'express'
import { getUsers } from './controllers/GetUsersController'
import { createUser } from './controllers/CreateUserController'
import { updateUser } from './controllers/UpdateUserController'
import { deleteUser } from './controllers/DeleteUserController'
import { login } from './controllers/LoginController'
import { register } from './controllers/RegisterController'
import { listPublicPlans } from './controllers/ListPublicPlansController'
import { getSubscriptionStatus } from './controllers/GetSubscriptionStatusController'
import { markSubscriptionAsPaid } from './controllers/MarkSubscriptionAsPaidController'
import { changeSubscriptionPlan } from './controllers/ChangeSubscriptionPlanController'
import { authenticateToken } from '../../middleware/auth'
import { authorizeRoles, enforceEstablishmentScope } from '../../middleware/authorization'
import { ensureSubscriptionAccess } from '../../middleware/subscription'

const router = Router()

router.post('/login', login)
router.post('/register', register)
router.get('/plans/public', listPublicPlans)

router.use(authenticateToken)

router.get('/subscription/status', getSubscriptionStatus)
router.post('/subscription/change-plan', authorizeRoles('ADMIN', 'MANAGER'), changeSubscriptionPlan)
router.post('/subscription/mark-paid', authorizeRoles('ADMIN'), markSubscriptionAsPaid)

router.use(ensureSubscriptionAccess)

router.get('/', authorizeRoles('ADMIN', 'MANAGER'), enforceEstablishmentScope('query'), getUsers)
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createUser)
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updateUser)
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), deleteUser)

export default router
