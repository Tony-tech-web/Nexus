import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', NotificationController.getAll);
router.patch('/:id/read', NotificationController.markRead);

export default router;
