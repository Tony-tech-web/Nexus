import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, InventoryController.getAll);
router.post('/', authenticate, authorize(['ADMIN', 'STAFF']), InventoryController.create);
router.put('/:id', authenticate, authorize(['ADMIN', 'STAFF']), InventoryController.update);
router.delete('/:id', authenticate, authorize(['ADMIN']), InventoryController.delete);

export default router;

