const express = require('express');
const { getSummary, getDailyActivity, getSubjectBreakdown } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/daily', getDailyActivity);
router.get('/subjects', getSubjectBreakdown);

module.exports = router;
