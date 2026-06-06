import express from 'express';
import { shortenUrl, redirectUrl, getMyUrls } from '../controllers/urlController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { generateQrCode } from '../controllers/qrController.js';
const router = express.Router();

// 1. Create Short Link (Protected)
router.post('/shorten', authMiddleware, shortenUrl);

// 2. Get My Links (Protected) <--- ADD THIS NEW ROUTE
router.get('/myurls', authMiddleware, getMyUrls);

// 3. Redirect (Public) - KEEP THIS AT THE BOTTOM
router.get('/:shortCode', redirectUrl);
router.get('/qr/:shortCode', generateQrCode);
export default router;