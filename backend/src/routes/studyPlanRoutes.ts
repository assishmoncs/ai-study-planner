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
import { userLimiter, aiLimiter } from '../middleware/rateLimiters';

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
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high, urgent] }
 *       - in: query
 *         name: subject
 *         schema: { type: string }
 *       - in: query
 *         name: search
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
 *               title: { type: string, maxLength: 200 }
 *               subject: { type: string, maxLength: 120 }
 *               description: { type: string, maxLength: 1000 }
 *               startDate: { type: string, format: date-time }
 *               endDate: { type: string, format: date-time }
 *               targetHours: { type: number, minimum: 0.5 }
 *               priority: { type: string, enum: [low, medium, high, urgent] }
 *               color: { type: string }
 *               aiGenerated: { type: boolean }
 *               aiSuggestions: { type: string }
 *     responses:
 *       201:
 *         description: Study plan created
 */
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('subject')
      .trim()
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ max: 120 })
      .withMessage('Subject cannot exceed 120 characters'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate')
      .isISO8601()
      .withMessage('Valid end date is required')
      .custom((value, { req }) => {
        if (req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
          throw new Error('End date must be on or after the start date');
        }
        return true;
      }),
    body('targetHours')
      .isFloat({ min: 0.5, max: 5000 })
      .withMessage('Target hours must be between 0.5 and 5000'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority'),
    body('status')
      .optional()
      .isIn(['active', 'paused', 'completed', 'archived'])
      .withMessage('Invalid status'),
    body('color')
      .optional()
      .matches(/^#([0-9a-fA-F]{3}){1,2}$/)
      .withMessage('Color must be a valid hex code'),
  ],
  createPlan
);

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
 *               daysAvailable: { type: integer, minimum: 1, maximum: 60 }
 *               hoursPerDay: { type: number, minimum: 0.5, maximum: 16 }
 *               currentLevel: { type: string, enum: [beginner, intermediate, advanced] }
 *               goals: { type: string }
 *     responses:
 *       200:
 *         description: AI-generated study plan suggestions
 */
router.post(
  '/ai/suggest',
  aiLimiter,
  [
    body('subject')
      .trim()
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ max: 120 })
      .withMessage('Subject cannot exceed 120 characters'),
    body('daysAvailable')
      .isInt({ min: 1, max: 60 })
      .withMessage('Days available must be an integer between 1 and 60'),
    body('hoursPerDay')
      .isFloat({ min: 0.5, max: 16 })
      .withMessage('Hours per day must be between 0.5 and 16'),
    body('currentLevel')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Current level must be beginner, intermediate, or advanced'),
  ],
  getAISuggestions
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
router.patch(
  '/:id',
  [
    body('title').optional().trim().notEmpty().isLength({ max: 200 }),
    body('subject').optional().trim().notEmpty().isLength({ max: 120 }),
    body('targetHours').optional().isFloat({ min: 0.5, max: 5000 }),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('status').optional().isIn(['active', 'paused', 'completed', 'archived']),
    body('color')
      .optional()
      .matches(/^#([0-9a-fA-F]{3}){1,2}$/),
  ],
  updatePlan
);

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
  [body('hours').isFloat({ min: 0.01, max: 24 }).withMessage('Hours must be between 0.01 and 24')],
  logHours
);

export default router;
