const express = require('express');
const { getSummary, getDailyActivity, getSubjectBreakdown } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { userLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.use(protect, userLimiter);

router.get('/summary', getSummary);
router.get('/daily', getDailyActivity);
router.get('/subjects', getSubjectBreakdown);

module.exports = router;
