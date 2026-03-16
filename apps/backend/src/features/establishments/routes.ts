import { Router } from 'express'
import { createEstablishment } from './controllers/CreateEstablishmentController'
import { getEstablishments } from './controllers/GetEstablishmentController'
import { updateEstablishment } from './controllers/UpdateEstablishmentController'
import { deleteEstablishment } from './controllers/DeleteEstablishmentController'
import { authorizeRoles } from '../../middleware/authorization'

const router = Router()

router.get('/', authorizeRoles('ADMIN', 'MANAGER', 'BARTENDER', 'CHEF'), getEstablishments)
router.post('/', authorizeRoles('ADMIN'), createEstablishment)
router.put('/:id', authorizeRoles('ADMIN'), updateEstablishment)
router.delete('/:id', authorizeRoles('ADMIN'), deleteEstablishment)

export default router
