// src/jobs/cleanupJob.js
import cron from 'node-cron';
import { query } from '../config/db.js';

const startCleanupJob = () => {
    // This cron expression means: "Run at minute 0 past every hour" (runs once an hour)
    // You can change '0 * * * *' to '*/5 * * * *' if you want it to run every 5 minutes for testing!
    cron.schedule('0 * * * *', async () => {
        console.log('🧹 [CRON] Starting background cleanup job...');

        const deleteQuery = `
            DELETE FROM urls 
            WHERE 
                (expires_at IS NOT NULL AND expires_at <= NOW()) 
                OR 
                (max_clicks IS NOT NULL AND click_count >= max_clicks)
            RETURNING short_code;
        `;

        try {
            const { rows } = await query(deleteQuery);
            if (rows.length > 0) {
                console.log(`✅ [CRON] Deleted ${rows.length} expired URLs from the database.`);
                // Optional: You could also loop through rows and tell Redis to delete them from cache here!
            } else {
                console.log('✨ [CRON] Database is clean. No expired URLs found.');
            }
        } catch (error) {
            console.error('❌ [CRON] Error running cleanup job:', error);
        }
    });
};

export default startCleanupJob;