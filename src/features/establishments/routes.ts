import { Router } from 'express'
import { createEstablishment } from './controllers/CreateEstablishmentController'
import { getEstablishments } from './controllers/GetEstablishmentController'
import { updateEstablishment } from './controllers/UpdateEstablishmentController'
import { deleteEstablishment } from './controllers/DeleteEstablishmentController'

const router = Router()

router.get('/', getEstablishments)
router.post('/', createEstablishment)
router.put('/:id', updateEstablishment)
router.delete('/:id', deleteEstablishment)

export default router
