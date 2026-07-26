import { Router } from 'express';
import { body } from 'express-validator';
import {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
  deletePlan,
  logHours,
  getAISuggestions,
} from '../controllers/studyPlanController';
import { protect } from '../middleware/authMiddleware';
import { userLimiter } from '../middleware/rateLimiters';

const router = Router();

router.use(protect, userLimiter);

/**
 * @openapi
 * /api/study-plans:
 *   get:
 *     summary: List study plans for the authenticated user
 *     tags: [Study Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, paused, completed, archived] }
 *       - in: query
 *         name: subject
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of study plans
 */
router.get('/', getPlans);

/**
 * @openapi
 * /api/study-plans:
 *   post:
 *     summary: Create a new study plan
 *     tags: [Study Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, subject, startDate, endDate, targetHours]
 *             properties:
 *               title: { type: string }
 *               subject: { type: string }
 *               description: { type: string }
 *               startDate: { type: string, format: date-time }
 *               endDate: { type: string, format: date-time }
 *               targetHours: { type: number, minimum: 0.5 }
 *               priority: { type: string, enum: [low, medium, high, urgent] }
 *               color: { type: string }
 *     responses:
 *       201:
 *         description: Study plan created
 */
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('targetHours').isFloat({ min: 0.5 }).withMessage('Target hours must be at least 0.5'),
  ],
  createPlan
);

/**
 * @openapi
 * /api/study-plans/{id}:
 *   get:
 *     summary: Get a single study plan
 *     tags: [Study Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Study plan details
 *       404:
 *         description: Study plan not found
 */
router.get('/:id', getPlan);

/**
 * @openapi
 * /api/study-plans/{id}:
 *   patch:
 *     summary: Update a study plan
 *     tags: [Study Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Study plan updated
 */
router.patch('/:id', updatePlan);

/**
 * @openapi
 * /api/study-plans/{id}:
 *   delete:
 *     summary: Delete a study plan
 *     tags: [Study Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Study plan deleted
 */
router.delete('/:id', deletePlan);

/**
 * @openapi
 * /api/study-plans/ai/suggest:
 *   post:
 *     summary: Generate AI study plan suggestions
 *     tags: [Study Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject, daysAvailable, hoursPerDay]
 *             properties:
 *               subject: { type: string }
 *               daysAvailable: { type: integer }
 *               hoursPerDay: { type: number }
 *               currentLevel: { type: string, enum: [beginner, intermediate, advanced] }
 *     responses:
 *       200:
 *         description: AI-generated suggestions
 */
router.post('/ai/suggest', getAISuggestions);

/**
 * @openapi
 * /api/study-plans/{id}/log-hours:
 *   post:
 *     summary: Log study hours to a plan
 *     tags: [Study Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [hours]
 *             properties:
 *               hours: { type: number, minimum: 0.01 }
 *     responses:
 *       200:
 *         description: Hours logged
 */
router.post(
  '/:id/log-hours',
  [body('hours').isFloat({ min: 0.01 }).withMessage('Hours must be greater than 0')],
  logHours
);

export default router;
