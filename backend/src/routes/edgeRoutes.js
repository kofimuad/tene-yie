// src/routes/edgeRoutes.js
import express from 'express';
import * as edgeController from '../controllers/edgeController.js';

const router = express.Router();

router.post('/', edgeController.createEdge);
router.get('/', edgeController.getEdgesByWorkflow);
router.get('/:id', edgeController.getEdgeById);
router.get('/connections/:nodeId', edgeController.getConnectedNodes);
router.delete('/:id', edgeController.deleteEdge);

export default router;
