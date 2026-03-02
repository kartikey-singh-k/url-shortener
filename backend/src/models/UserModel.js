import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';

class UserModel {
    
    // 1. Create New User (Sign Up)
    static async create(email, password) {
        // Step A: Hash the password (Security Rule #1)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Step B: Save to DB
        const sql = `
            INSERT INTO users (email, password) 
            VALUES ($1, $2) 
            RETURNING id, email, created_at;
        `;
        
        // Note: We return everything EXCEPT the password
        const { rows } = await query(sql, [email, hashedPassword]);
        return rows[0];
    }

    // 2. Find User by Email (Login)
    static async findByEmail(email) {
        const sql = `SELECT * FROM users WHERE email = $1`;
        const { rows } = await query(sql, [email]);
        return rows[0]; // Returns user OR undefined
    }
}

export default UserModel;