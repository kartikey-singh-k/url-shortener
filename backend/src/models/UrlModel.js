// src/models/UrlModel.js
import { query } from '../config/db.js';
import { encode } from '../utils/base62.js';

class UrlModel {
    
    // 1. Create a Short URL
    static async create(originalUrl, userId = null, customAlias = null, expiresAt = null, maxClicks = null) {
        
        // ---------------------------------------------------------
        // PATH A: User provided a Custom Alias (One-step insert)
        // ---------------------------------------------------------
        if (customAlias) {
            try {
                const sqlInsert = `
                    INSERT INTO urls (original_url, user_id, short_code, expires_at, max_clicks) 
                    VALUES ($1, $2, $3, $4, $5) 
                    RETURNING *;
                `;
                const result = await query(sqlInsert, [originalUrl, userId, customAlias, expiresAt, maxClicks]);
                return result.rows[0];
            } catch (error) {
                // Catch unique constraint violation if alias is taken
                if (error.code === '23505') { 
                    throw new Error('Custom alias is already in use. Please choose another.');
                }
                throw error;
            }
        }

        // ---------------------------------------------------------
        // PATH B: Auto-generate via ID-Encoding (Your 2-step method)
        // ---------------------------------------------------------
        
        // Use a randomized temp code to prevent unique constraint crashes 
        // if two people generate links at the exact same millisecond
        const tempCode = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        // Step A: Insert the URL first to get a unique ID
        const sqlInsert = `
            INSERT INTO urls (original_url, user_id, short_code, expires_at, max_clicks) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id;
        `;
        const { rows } = await query(sqlInsert, [originalUrl, userId, tempCode, expiresAt, maxClicks]);
        const id = rows[0].id;

        // Step B: Encode that ID into a Short Code (e.g., ID 105 -> "1H")
        const shortCode = encode(id);

        // Step C: Update the row with the actual unique short code
        const sqlUpdate = `
            UPDATE urls 
            SET short_code = $1 
            WHERE id = $2 
            RETURNING *;
        `;
        const result = await query(sqlUpdate, [shortCode, id]);
        return result.rows[0];
    }

    // 2. Find by Short Code (For Redirects)
    static async findByShortCode(shortCode) {
        const sql = `SELECT * FROM urls WHERE short_code = $1`;
        const { rows } = await query(sql, [shortCode]);
        return rows[0];
    }

    // 3. Increment Click Count (Analytics)
    static async incrementClicks(shortCode) {
        const sql = `
            UPDATE urls 
            SET click_count = click_count + 1 
            WHERE short_code = $1;
        `;
        await query(sql, [shortCode]);
    }
    
    // 4. Find all URLs for a specific User
    static async findByUser(userId) {
        const sql = `
            SELECT * FROM urls 
            WHERE user_id = $1 
            ORDER BY created_at DESC;
        `;
        const { rows } = await query(sql, [userId]);
        return rows;
    }
}

export default UrlModel;