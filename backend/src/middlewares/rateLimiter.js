import redisClient from '../config/redis.js';

export const slidingWindowLimiter = async (req, res, next) => {
    try {
        // 1. Identify User (Auth = 100 req/hr, Anon = 10 req/hr)
        const isAuth = !!req.user; // Assumes your auth middleware attaches req.user
        const limit = isAuth ? 100 : 10;
        const identifier = isAuth ? req.user.id : (req.headers['x-forwarded-for'] || req.socket.remoteAddress);
        
        const key = `ratelimit:${identifier}`;
        const now = Date.now();
        const windowSize = 60 * 60 * 1000; // 1 hour in milliseconds
        const clearBefore = now - windowSize;

        // 2. Execute Redis commands atomically
        const multi = redisClient.multi();
        multi.zRemRangeByScore(key, 0, clearBefore); // Remove clicks older than 1 hour
        multi.zAdd(key, { score: now, value: `${now}-${crypto.randomUUID()}` }); // Log current click
        multi.zCard(key); // Count how many clicks are left in the 1-hour window
        multi.expire(key, 3600); // Ensure the key deletes itself eventually
        
        const results = await multi.exec();
        const requestCount = results[2]; // The result of zCard

        // 3. Check against limit
        if (requestCount > limit) {
            res.setHeader('Retry-After', 3600); // Standard HTTP header for "Try again later"
            return res.status(429).json({ 
                error: 'Too many requests. Please try again later.', 
                code: 'RATE_LIMIT_EXCEEDED' 
            });
        }

        next();
    } catch (error) {
        console.error('Rate Limiting Error:', error);
        next(); // If Redis fails, let the request through (Fail-open policy)
    }
};