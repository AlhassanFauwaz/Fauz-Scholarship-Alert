import express from 'express';
import {
  getSources,
  getSource,
  createSource,
  updateSource,
  deleteSource,
  triggerSourceSync,
} from '../controllers/sourceController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, admin);

router.get('/', getSources);
router.post('/', createSource);
router.get('/:id', getSource);
router.put('/:id', updateSource);
router.delete('/:id', deleteSource);
router.post('/:id/sync', triggerSourceSync);

export default router;
