import { Router } from 'express';
import monitor from '../routes/monitor.routes.js';
import register from '../routes/register.routes.js';
import enable from '../routes/enable.routes.js';
import api from '../routes/api.routes.js';

const router = Router();

router.use('/monitor', monitor);
router.use('/register', register);
router.use('/enable', enable);
router.use('/v1', api);

export default router;
