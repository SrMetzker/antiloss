import { Router } from 'express'
import { getUsers } from './controllers/GetUsersController'
import { createUser } from './controllers/CreateUserController'
import { updateUser } from './controllers/UpdateUserController'
import { deleteUser } from './controllers/DeleteUserController'
import { login } from './controllers/LoginController'
import { authenticateToken } from '../../middleware/auth'
import { authorizeRoles, enforceEstablishmentScope } from '../../middleware/authorization'

const router = Router()

router.post('/login', login)

router.use(authenticateToken)

router.get('/', authorizeRoles('ADMIN', 'MANAGER'), enforceEstablishmentScope('query'), getUsers)
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createUser)
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updateUser)
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), deleteUser)

export default router
