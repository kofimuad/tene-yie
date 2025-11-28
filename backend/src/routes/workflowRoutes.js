// src/routes/workflowRoutes.js
// Workflow API endpoints
// Using ES6 import/export

import express from 'express';
import * as workflowController from '../controllers/workflowController.js';

const router = express.Router();

router.post('/', workflowController.createWorkflow);
router.get('/', workflowController.getAllWorkflows);
router.get('/:id', workflowController.getWorkflowById);
router.put('/:id', workflowController.updateWorkflow);
router.delete('/:id', workflowController.deleteWorkflow);

export default router;