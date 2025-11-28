// src/routes/nodeRoutes.js
import express from 'express';
import * as nodeController from '../controllers/nodeController.js';

const router = express.Router();

router.post('/', nodeController.createNode);
router.get('/', nodeController.getNodesByWorkflow);
router.get('/:id', nodeController.getNodeById);
router.put('/:id', nodeController.updateNode);
router.delete('/:id', nodeController.deleteNode);

export default router;