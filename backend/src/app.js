// src/app.js
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import urlRoutes from './routes/urlRoutes.js'; 
import authRoutes from './routes/authRoutes.js';
import logger from './config/logger.js'; // ✅ IMPORT YOUR NEW LOGGER

const app = express();

// Security and Parsing
app.use(helmet()); 
app.use(cors()); 
app.use(express.json()); 

// ✅ NEW: Connect Morgan to Winston
// This tells Morgan to send request logs to Winston instead of just the console
const morganFormat = ':method :url :status :response-time ms';
app.use(morgan(morganFormat, {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

// Health Check
app.get('/health', (req, res) => {
    logger.info('Health check endpoint hit'); // ✅ Replaced console.log with logger
    res.status(200).json({
        status: 'success',
        message: 'Server is healthy and running 🚀'
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/', urlRoutes);

// 404 Handler
app.use((req, res, next) => {
    logger.warn(`404 Error: Someone tried to visit ${req.originalUrl}`); // ✅ Log bad URLs
    res.status(404).json({ message: 'Route not found' });
});

export default app;