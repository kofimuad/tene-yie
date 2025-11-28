// src/routes/executionRoutes.js
// Execution API endpoints
// Using ES6 import/export

import express from 'express';
import * as executionController from '../controllers/executionController.js';

const router = express.Router();

router.post('/run/:workflowId', executionController.runWorkflow);
router.get('/', executionController.getExecutionHistory);
router.get('/:executionId', executionController.getExecutionDetails);
router.get('/stats/:workflowId', executionController.getExecutionStats);

export default router;