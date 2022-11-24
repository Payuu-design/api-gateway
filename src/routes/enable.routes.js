import { Router } from 'express';
import enable from '../controllers/enable.controllers.js';

const router = Router();

router.put('/:id', enable);

export default router;
