import { Router } from 'express';
import { register, unregister } from '../controllers/register.controllers.js';

const router = Router();

router.post('/', register);
router.delete('/:id', unregister);

export default router;
