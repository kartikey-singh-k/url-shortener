// src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    // 1. Get the header: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;

    // 2. Check if it exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // 3. Extract the token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];

    try {
        // 4. Verify the token (Is it fake? Is it expired?)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 5. Success! Attach user info to the request object
        req.user = decoded; 
        
        // 6. Move to the next step (The Controller)
        next();

    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

export default authMiddleware;