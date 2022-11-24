import { Router } from 'express';
import api from '../controllers/api.controllers.js';

const router = Router();

router.use('/', api);

export default router;
