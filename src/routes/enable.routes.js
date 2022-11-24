import { Router } from 'express';
import { enable, enablePOST } from '../controllers/enable.controllers.js';

const router = Router();

router.put('/:id', enable);
router.post('/:id/value/:value', enablePOST);

export default router;
