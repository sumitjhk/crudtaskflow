// ============================================================
//  server.js — Entry Point
//  Responsibility: Connect to DB and start the HTTP server
//  This file does NOT configure Express — that lives in app.js
// ============================================================

const app = require('./app');
const connectDB = require('./config/db');
require('dotenv').config();

// ─── Port ────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;

// ─── Start Server ────────────────────────────────────────────
// First connect to MongoDB, then start listening for requests
// If DB connection fails, we do NOT start the server

const startServer = async () => {
  try {

    // Step 1: Connect to MongoDB
    await connectDB();

    // Step 2: Start Express server only after DB is connected
    app.listen(PORT, () => {
      console.log('─────────────────────────────────────────');
      console.log(` Server running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` API Base URL: http://localhost:${PORT}/api/v1`);
      console.log(` Postman Base URL: http://localhost:${PORT}`);
      console.log('─────────────────────────────────────────');
    });

  } catch (error) {

    // If MongoDB connection fails, log and exit
    console.error('❌  Failed to connect to database:', error.message);
    process.exit(1); // Exit with failure code

  }
};

// ─── Handle Unhandled Promise Rejections ─────────────────────
// Catches any async errors that were not caught elsewhere
// e.g. a mongoose query that throws but has no .catch()
process.on('unhandledRejection', (err) => {
  console.error('❌  Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// ─── Handle Uncaught Exceptions ──────────────────────────────
// Catches synchronous errors thrown outside of async context
// e.g. a typo in code that crashes immediately
process.on('uncaughtException', (err) => {
  console.error('❌  Uncaught Exception:', err.message);
  process.exit(1);
});

// ─── Run ─────────────────────────────────────────────────────
startServer();