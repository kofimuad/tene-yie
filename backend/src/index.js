// src/index.js
// Main Express server entry point
// Using ES6 import/export syntax

import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import workflowRoutes from './routes/workflowRoutes.js';
import nodeRoutes from './routes/nodeRoutes.js';
import edgeRoutes from './routes/edgeRoutes.js';
import executionRoutes from './routes/executionRoutes.js';

// ========== INITIALIZATION ==========
const app = express();
const PORT = process.env.PORT || 5000;

// ========== MIDDLEWARE ==========
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// ========== API ROUTES ==========
app.use('/api/workflows', workflowRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/edges', edgeRoutes);
app.use('/api/executions', executionRoutes);

// ========== ERROR HANDLING ==========
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📝 Test it: http://localhost:${PORT}/api/health`);
});