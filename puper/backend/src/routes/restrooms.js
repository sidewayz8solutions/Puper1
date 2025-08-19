const express = require('express');
const { pool } = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get nearby restrooms
router.get('/', async (req, res) => {
    const { lat, lon, radius = 5000, wheelchair_accessible, baby_changing, gender_neutral, requires_fee } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    try {
        let query = `
            SELECT r.*, 
                   ST_Distance(r.location, ST_Point($2, $1)::geography) as distance,
                   COALESCE(AVG(rev.overall_rating), 0) as avg_rating,
                   COUNT(rev.id) as review_count
            FROM restrooms r
            LEFT JOIN reviews rev ON r.id = rev.restroom_id
            WHERE ST_DWithin(r.location, ST_Point($2, $1)::geography, $3)
            AND r.status = 'active'
        `;
        
        const params = [lat, lon, radius];
        let paramIndex = 4;

        if (wheelchair_accessible !== undefined) {
            query += ` AND r.wheelchair_accessible = $${paramIndex}`;
            params.push(wheelchair_accessible === 'true');
            paramIndex++;
        }

        if (baby_changing !== undefined) {
            query += ` AND r.baby_changing = $${paramIndex}`;
            params.push(baby_changing === 'true');
            paramIndex++;
        }

        if (gender_neutral !== undefined) {
            query += ` AND r.gender_neutral = $${paramIndex}`;
            params.push(gender_neutral === 'true');
            paramIndex++;
        }

        if (requires_fee !== undefined) {
            query += ` AND r.requires_fee = $${paramIndex}`;
            params.push(requires_fee === 'true');
            paramIndex++;
        }

        query += `
            GROUP BY r.id
            ORDER BY distance
            LIMIT 50
        `;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching restrooms:', error);
        res.status(500).json({ error: 'Failed to fetch restrooms' });
    }
});

// Get single restroom
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            SELECT r.*, 
                   COALESCE(AVG(rev.overall_rating), 0) as avg_rating,
                   COUNT(rev.id) as review_count,
                   u.username as created_by_username
            FROM restrooms r
            LEFT JOIN reviews rev ON r.id = rev.restroom_id
            LEFT JOIN users u ON r.created_by = u.id
            WHERE r.id = $1
            GROUP BY r.id, u.username
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Restroom not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching restroom:', error);
        res.status(500).json({ error: 'Failed to fetch restroom' });
    }
});

// Create restroom
router.post('/', authenticateToken, async (req, res) => {
    const { name, address, lat, lon, wheelchair_accessible, baby_changing, gender_neutral, requires_fee, opening_hours } = req.body;

    if (!name || !lat || !lon) {
        return res.status(400).json({ error: 'Name, latitude, and longitude required' });
    }

    try {
        const result = await pool.query(`
            INSERT INTO restrooms (
                name, address, lat, lon, location, wheelchair_accessible, 
                baby_changing, gender_neutral, requires_fee, opening_hours, created_by
            ) VALUES ($1, $2, $3, $4, ST_Point($4, $3), $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [name, address, lat, lon, wheelchair_accessible, baby_changing, gender_neutral, requires_fee, opening_hours, req.user.id]);

        // Award points for adding restroom
        await pool.query('UPDATE users SET points = points + 25 WHERE id = $1', [req.user.id]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating restroom:', error);
        res.status(500).json({ error: 'Failed to create restroom' });
    }
});

// Search along route
router.post('/route', async (req, res) => {
    const { polyline, maxDistance = 1000 } = req.body;

    if (!polyline) {
        return res.status(400).json({ error: 'Polyline required' });
    }

    try {
        // This would need actual polyline decoding and route analysis
        // For now, return empty array
        res.json([]);
    } catch (error) {
        console.error('Error searching route:', error);
        res.status(500).json({ error: 'Failed to search route' });
    }
});

module.exports = router;
