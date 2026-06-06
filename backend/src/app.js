// src/app.js
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import crypto from 'crypto'; // ✅ NEW: Import crypto for Request IDs

import urlRoutes from './routes/urlRoutes.js'; 
import authRoutes from './routes/authRoutes.js';
import logger from './config/logger.js'; 

const app = express();

// Security and Parsing
app.use(helmet()); 
app.use(cors()); 
app.use(express.json()); 

app.use((req, res, next) => {
    req.id = crypto.randomUUID();
    res.setHeader('X-Request-ID', req.id);
    next();
});

// Connect Morgan to Winston
const morganFormat = '[:req[x-request-id]] :method :url :status :response-time ms';
app.use(morgan(morganFormat, {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

// Health Check
app.get('/health', (req, res) => {
    logger.info(`[${req.id}] Health check endpoint hit`); 
    res.status(200).json({
        status: 'success',
        message: 'Server is healthy and running 🚀'
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use('/', urlRoutes);

// 404 Handler
app.use((req, res, next) => {
    logger.warn(`[${req.id}] 404 Error: Someone tried to visit ${req.originalUrl}`); 
    res.status(404).json({ error: 'Route not found', code: 'NOT_FOUND' });
});

app.use((err, req, res, next) => {
    logger.error(`[${req.id}] Unhandled Error: ${err.message}`, err);
    
    // Ensure the consistent format you requested for frontend parsing
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        code: err.code || 'INTERNAL_ERROR'
    });
});

export default app;