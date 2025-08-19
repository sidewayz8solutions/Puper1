const express = require('express');
const { pool } = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images allowed'));
        }
    }
});

router.post('/:restroomId', authenticateToken, upload.array('photos', 3), async (req, res) => {
    const { restroomId } = req.params;
    const { cleanlinessRating, lightingRating, suppliesRating, safetyRating, accessibilityRating, comment } = req.body;

    try {
        const existing = await pool.query(
            'SELECT id FROM reviews WHERE restroom_id = $1 AND user_id = $2',
            [restroomId, req.user.id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Already reviewed' });
        }

        const ratings = [cleanlinessRating, lightingRating, suppliesRating, safetyRating, accessibilityRating]
            .map(Number).filter(r => !isNaN(r));
        const overallRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

        const reviewResult = await pool.query(
            `INSERT INTO reviews (
                restroom_id, user_id, cleanliness_rating, lighting_rating,
                supplies_rating, safety_rating, accessibility_rating, 
                overall_rating, comment
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [restroomId, req.user.id, cleanlinessRating, lightingRating, 
             suppliesRating, safetyRating, accessibilityRating, 
             overallRating.toFixed(1), comment]
        );

        if (req.files) {
            for (const file of req.files) {
                await pool.query(
                    'INSERT INTO review_photos (review_id, photo_url) VALUES ($1, $2)',
                    [reviewResult.rows[0].id, `/uploads/${file.filename}`]
                );
            }
        }

        await pool.query('UPDATE users SET points = points + 10 WHERE id = $1', [req.user.id]);

        res.status(201).json(reviewResult.rows[0]);
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

module.exports = router;
