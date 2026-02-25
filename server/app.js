// ============================================================
//  app.js — Express Application Configuration
//  Responsibility: Setup middleware, routes, and error handling
//  This file does NOT start the server — that lives in server.js
// ============================================================

const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const morgan         = require('morgan');
const rateLimit      = require('express-rate-limit');
const cookieParser   = require('cookie-parser');

// ─── Route Imports ───────────────────────────────────────────
const authRoutes     = require('./routes/authRoutes');
const taskRoutes     = require('./routes/taskRoutes');
const adminRoutes    = require('./routes/adminRoutes');

// ─── Create Express App ──────────────────────────────────────
const app = express();

// ============================================================
//  MIDDLEWARE
// ============================================================

// 1. Helmet — sets secure HTTP headers on every response
app.use(helmet());

// 2. CORS — allows frontend to talk to backend with cookies
app.use(cors({
  origin      : 'https://crudtaskflow-client.vercel.app',
  methods     : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders : ['Content-Type', 'Authorization'],
  credentials : true, // required for HTTP-only cookies to work
}));

// 3. Cookie Parser — parses cookies from incoming requests
//    required to read HTTP-only token cookie in authMiddleware
app.use(cookieParser());

// 4. Body Parser — parses incoming JSON request bodies
app.use(express.json());

// 5. URL Encoded — parses form data
app.use(express.urlencoded({ extended: false }));

// 6. Morgan — logs every request to terminal during development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 7. Rate Limiter — max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs : 15 * 60 * 1000,
  max      : 100,
  message  : {
    success : false,
    message : 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', limiter);

// ============================================================
//  HEALTH CHECK ROUTE
// ============================================================

app.get('/', (req, res) => {
  res.status(200).json({
    success : true,
    message : '🚀 TaskFlow API is running',
    version : 'v1',
  });
});

// ============================================================
//  API ROUTES — v1
// ============================================================

app.use('/api/v1/auth',  authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/admin', adminRoutes);

// ============================================================
//  404 HANDLER — Unknown Routes
// ============================================================

app.use((req, res, next) => {
  res.status(404).json({
    success : false,
    message : `Route ${req.originalUrl} not found`,
  });
});

// ============================================================
//  GLOBAL ERROR HANDLER — Must Be Last
// ============================================================

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success : false,
    message : err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;