import UserModel from '../models/UserModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper: Generate JWT Token
const generateToken = (id) => {
    // This token is the user's "Digital Badge"
    // It expires in 30 days
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// 1. Register User
export const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user already exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create user
        const user = await UserModel.create(email, password);

        // Send response with Token
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email
            },
            token: generateToken(user.id)
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// 2. Login User
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await UserModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password (Compare plain text vs. Hash in DB)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Success: Send Token
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email
            },
            token: generateToken(user.id)
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};