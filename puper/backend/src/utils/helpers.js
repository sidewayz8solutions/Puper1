const awardPoints = async (userId, points, reason) => {
    const { pool } = require('./database');
    
    await pool.query(
        'UPDATE users SET points = points + $1 WHERE id = $2',
        [points, userId]
    );

    const userResult = await pool.query(
        'SELECT points, level FROM users WHERE id = $1',
        [userId]
    );

    const user = userResult.rows[0];
    const newLevel = Math.floor(user.points / 100) + 1;

    if (newLevel > user.level) {
        await pool.query(
            'UPDATE users SET level = $1 WHERE id = $2',
            [newLevel, userId]
        );
    }
};

const awardBadge = async (userId, badgeId) => {
    const { pool } = require('./database');
    
    await pool.query(
        'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, badgeId]
    );
};

module.exports = { awardPoints, awardBadge };
