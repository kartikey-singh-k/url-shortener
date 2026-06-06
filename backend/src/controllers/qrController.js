// src/controllers/qrController.js
import QRCode from 'qrcode';

export const generateQrCode = async (req, res) => {
    try {
        const { shortCode } = req.params;
        
        // This is the URL that people will actually visit when they scan the code
        const fullUrl = `https://url-shortener-dmyt.onrender.com/${shortCode}`;
        
        // Generate a high-quality Base64 PNG image
        const qrCodeDataUrl = await QRCode.toDataURL(fullUrl, {
            width: 300,
            margin: 2,
            color: {
                dark: '#0f172a',  // Your custom dark slate color
                light: '#ffffff'  // White background
            }
        });
        
        // Send the image string back to React
        res.status(200).json({ qrCode: qrCodeDataUrl });
    } catch (error) {
        console.error('QR Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
};