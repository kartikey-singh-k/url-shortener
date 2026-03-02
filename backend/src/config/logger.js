// src/config/logger.js
import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

// Define how we want the logs to look
const logFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});

const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        // 1. Write all errors to error.log
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        // 2. Write everything to combined.log
        new winston.transports.File({ filename: 'logs/combined.log' })
    ],
});

// 3. If we are developing locally, also print to the console with colors
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(colorize(), logFormat)
    }));
}

export default logger;