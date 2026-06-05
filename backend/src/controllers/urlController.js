import UrlModel from '../models/UrlModel.js';
import redisClient from '../config/redis.js';
import logger from '../config/logger.js'; 

// 1. Create Short Link
export const shortenUrl = async (req, res) => {
    try {
        const { originalUrl, customAlias, expiresAt, maxClicks } = req.body;
        
        // Validation
        if (!originalUrl) {
            return res.status(400).json({ error: 'originalUrl is required' });
        }

        // NOTE: We will need to update UrlModel.js next to handle these!
        const urlRecord = await UrlModel.create(
            originalUrl, 
            req.user.id, 
            customAlias || null, 
            expiresAt || null, 
            maxClicks || null
        );

        res.status(201).json({
            message: 'URL shortened successfully',
            shortCode: urlRecord.short_code,
            shortUrl: `${req.protocol}://${req.get('host')}/${urlRecord.short_code}`
        });

    } catch (error) {
        console.error('Shorten Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// 2. Get User's Links
export const getMyUrls = async (req, res) => {
    try {
        // req.user.id comes from the Auth Middleware
        const urls = await UrlModel.findByUser(req.user.id);
        
        res.status(200).json({ urls });
    } catch (error) {
        console.error('Get URLs Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// 3. Redirect (The REDIS Cached Version)
export const redirectUrl = async (req, res) => {
    try {
        const { shortCode } = req.params;

        // 1. Check Cache First (RAM is fast!)
        const cachedUrl = await redisClient.get(`url:${shortCode}`);

        if (cachedUrl) {
            console.log('⚡ CACHE HIT! Redirecting instantly.');
            // Update clicks in the background without making the user wait
            UrlModel.incrementClicks(shortCode).catch(err => console.error(err));
            return res.redirect(cachedUrl);
        }

        // 2. Cache Miss: Query Database (Disk is slow)
        console.log('🐌 CACHE MISS! Searching Database.');
        const urlRecord = await UrlModel.findByShortCode(shortCode);

        if (!urlRecord) {
            return res.status(404).json({ error: 'URL not found' });
        }

        // Check if current time is past the expiration time
        if (urlRecord.expires_at && new Date() >= new Date(urlRecord.expires_at)) {
            await redisClient.del(`url:${shortCode}`); // Ensure it's wiped from cache
            return res.status(410).json({ error: '410 Gone: This link has expired.' });
        }

        // Check if the current clicks have reached the maximum allowed clicks
        if (urlRecord.max_clicks !== null && urlRecord.click_count >= urlRecord.max_clicks) {
            await redisClient.del(`url:${shortCode}`); // Ensure it's wiped from cache
            return res.status(410).json({ error: '410 Gone: This link has reached its click limit.' });
        }

        // 3. Save to Cache for the next person
        // EX 86400 means "Expire in 24 hours" (TTL)
        await redisClient.setEx(`url:${shortCode}`, 86400, urlRecord.original_url);

        // 4. Update clicks and Redirect
        await UrlModel.incrementClicks(shortCode);
        res.redirect(urlRecord.original_url);

    } catch (error) {
        console.error('Redirect Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};