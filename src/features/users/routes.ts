import { Router } from 'express'
import { getUsers } from './controllers/GetUsersController'
import { createUser } from './controllers/CreateUserController'
import { updateUser } from './controllers/UpdateUserController'
import { deleteUser } from './controllers/DeleteUserController'
import { login } from './controllers/LoginController'

const router = Router()

router.post('/login', login)
router.get('/', getUsers)
router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

export default router
