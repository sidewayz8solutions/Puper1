const express = require('express');
const { pool } = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const userResult = await pool.query(
            `SELECT 
                u.id, u.username, u.display_name, u.points, u.level, u.created_at,
                COUNT(DISTINCT r.id) as review_count,
                COUNT(DISTINCT rest.id) as added_count
            FROM users u
            LEFT JOIN reviews r ON u.id = r.user_id
            LEFT JOIN restrooms rest ON u.id = rest.created_by
            WHERE u.id = $1
            GROUP BY u.id`,
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const badgesResult = await pool.query(
            `SELECT b.* FROM badges b
             JOIN user_badges ub ON b.id = ub.badge_id
             WHERE ub.user_id = $1`,
            [id]
        );

        const user = userResult.rows[0];
        user.badges = badgesResult.rows;

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.get('/leaderboard', async (req, res) => {
    const { period = 'all' } = req.query;

    try {
        let dateFilter = '';
        if (period === 'week') {
            dateFilter = "AND u.created_at >= NOW() - INTERVAL '7 days'";
        } else if (period === 'month') {
            dateFilter = "AND u.created_at >= NOW() - INTERVAL '30 days'";
        }

        const result = await pool.query(`
            SELECT u.id, u.username, u.display_name, u.points, u.level
            FROM users u
            WHERE 1=1 ${dateFilter}
            ORDER BY u.points DESC
            LIMIT 100
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

module.exports = router;
