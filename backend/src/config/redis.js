// src/config/redis.js
import { createClient } from 'redis';

// If you have a local Redis server, it defaults to localhost:6379
// If you use a cloud Redis, you will put the URL in your .env file
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Redis Connected Successfully'));

export const connectRedis = async () => {
    await redisClient.connect();
};

export default redisClient;