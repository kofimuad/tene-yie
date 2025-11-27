// src/index.js
// This is the main entry point for your Express server

// ========== IMPORTS ==========
// Express: Framework for building web servers
// cors: Allows your frontend (React) to communicate with this backend
// dotenv: Loads environment variables from .env file
require('dotenv').config();
import express, { json, urlencoded } from 'express';
import cors from 'cors';

// ========== INITIALIZATION ==========
const app = express();
const PORT = process.env.PORT || 5000;

// ========== MIDDLEWARE ==========
// Middleware runs on every request before reaching your routes

// 1. CORS Middleware - allows requests from your frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true // allows cookies and auth headers
}));

// 2. JSON Parser - converts incoming JSON request bodies to JavaScript objects
app.use(json());

// 3. URL Encoded Parser - handles form data
app.use(urlencoded({ extended: true }));

// ========== ROUTES ==========
// These will be defined in separate files, but we'll add them here

// Health check route - tests if server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Placeholder for workflow routes (we'll create these next)
// app.use('/api/workflows', require('./routes/workflowRoutes'));

// ========== ERROR HANDLING ==========
// Catches any errors that occur in your routes

// 404 Handler - runs if no route matches
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler - catches errors thrown in routes
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ========== START SERVER ==========
// Listen on the specified PORT
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📝 Test it: http://localhost:${PORT}/api/health`);
});