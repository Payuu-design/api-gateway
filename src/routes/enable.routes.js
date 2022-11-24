import { Router } from 'express';
import enable from '../controllers/enable.controllers.js';

const router = Router();

router.put('/', enable);

export default router;
