import { Router } from 'express';
import {
  getSummary,
  getDailyActivity,
  getSubjectBreakdown,
} from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';
import { userLimiter } from '../middleware/rateLimiters';

const router = Router();

router.use(protect, userLimiter);

/**
 * @openapi
 * /api/analytics/summary:
 *   get:
 *     summary: Get productivity summary
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary of task and plan stats
 */
router.get('/summary', getSummary);

/**
 * @openapi
 * /api/analytics/daily:
 *   get:
 *     summary: Get daily activity for the last N days
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200:
 *         description: Daily activity data
 */
router.get('/daily', getDailyActivity);

/**
 * @openapi
 * /api/analytics/subjects:
 *   get:
 *     summary: Get per-subject breakdown
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subject breakdown data
 */
router.get('/subjects', getSubjectBreakdown);

export default router;
