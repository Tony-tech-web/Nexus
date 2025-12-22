import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize(['ADMIN', 'STAFF']), OrderController.create);
router.get('/', authenticate, OrderController.getAll);

export default router;

