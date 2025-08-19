const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../utils/database');
const { validateRegistration, validateLogin } = require('../middleware/validation');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register
router.post('/register', validateRegistration, async (req, res) => {
    const { username, email, password, displayName } = req.body;

    try {
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash, display_name) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, username, email, display_name, points, level`,
            [username, email, hashedPassword, displayName || username]
        );

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);

        res.status(201).json({ token, user });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', validateLogin, async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                displayName: user.display_name,
                points: user.points,
                level: user.level
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Refresh token
router.post('/refresh', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({ error: 'Token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const newToken = jwt.sign(
            { id: decoded.id, username: decoded.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token: newToken });
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }
});

module.exports = router;
