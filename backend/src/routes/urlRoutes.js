import express from 'express';
import { shortenUrl, redirectUrl, getMyUrls } from '../controllers/urlController.js';
import { generateQrCode } from '../controllers/qrController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { slidingWindowLimiter } from '../middlewares/rateLimiter.js'; // ✅ NEW: Import your rate limiter

const router = express.Router();

// 1. Create Short Link (Protected AND Rate Limited)
router.post('/shorten', authMiddleware, slidingWindowLimiter, shortenUrl);
// 2. Get User's Links (Protected)
router.get('/myurls', authMiddleware, getMyUrls);

// 3. Generate QR Code
router.get('/qr/:shortCode', generateQrCode);

// 4. Redirect (Public) 
router.get('/:shortCode', redirectUrl);

export default router;