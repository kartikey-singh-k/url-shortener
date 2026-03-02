// src/server.js
import 'dotenv/config'; 
import app from './app.js'; 
import { query, initDB } from './config/db.js';
import { connectRedis } from './config/redis.js'; // ✅ IMPORT REDIS

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // 1. Test Database Connection
        const dbRes = await query('SELECT NOW()');
        console.log('✅ Database Connected. Time:', dbRes.rows[0].now);
        await initDB()
        // 2. Connect to Redis Cache
        await connectRedis(); // ✅ CONNECT TO REDIS

        // 3. Start Express Server (Only if DB and Redis succeed)
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
        });

    } catch (error) {
        // If DB or Redis fails, crash the app immediately
        console.error('❌ Failed to start server:', error.message);
        process.exit(1); 
    }
};

// Execute the boot sequence
startServer();