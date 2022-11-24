import { Router } from 'express';
import monitor from '../controllers/monitor.controllers.js';

const router = Router();

router.get('/', monitor);

export default router;
