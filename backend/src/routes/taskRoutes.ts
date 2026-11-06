import { Router } from 'express';
import { body } from 'express-validator';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  suggestTasks,
} from '../controllers/taskController';
import { protect } from '../middleware/authMiddleware';
import { userLimiter, aiLimiter } from '../middleware/rateLimiters';

const router = Router();

router.use(protect, userLimiter);

/**
 * @openapi
 * /api/tasks:
 *   get:
 *     summary: List tasks for the authenticated user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [todo, in_progress, completed, cancelled] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high, urgent] }
 *       - in: query
 *         name: studyPlan
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get('/', getTasks);

/**
 * @openapi
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, maxLength: 300 }
 *               description: { type: string, maxLength: 2000 }
 *               dueDate: { type: string, format: date-time }
 *               estimatedMinutes: { type: integer, minimum: 1, maximum: 1440 }
 *               priority: { type: string, enum: [low, medium, high, urgent] }
 *               status: { type: string, enum: [todo, in_progress, completed, cancelled] }
 *               studyPlan: { type: string }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Task created
 */
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Task title is required')
      .isLength({ max: 300 })
      .withMessage('Task title cannot exceed 300 characters'),
    body('estimatedMinutes')
      .optional()
      .isInt({ min: 1, max: 1440 })
      .withMessage('Estimated minutes must be an integer between 1 and 1440'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority'),
    body('status')
      .optional()
      .isIn(['todo', 'in_progress', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
  ],
  createTask
);

/**
 * @openapi
 * /api/tasks/ai/suggest:
 *   post:
 *     summary: Generate AI study task suggestions for a subject
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject]
 *             properties:
 *               subject: { type: string, example: Organic Chemistry }
 *               description: { type: string, example: Reaction mechanisms and stereochemistry }
 *     responses:
 *       200:
 *         description: AI-generated study tasks
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
    body('description')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
  ],
  suggestTasks
);

/**
 * @openapi
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a single task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 */
router.get('/:id', getTask);

/**
 * @openapi
 * /api/tasks/{id}:
 *   patch:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task updated
 */
router.patch(
  '/:id',
  [
    body('title').optional().trim().notEmpty().isLength({ max: 300 }),
    body('estimatedMinutes').optional().isInt({ min: 1, max: 1440 }),
    body('actualMinutes').optional().isInt({ min: 0 }),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('status').optional().isIn(['todo', 'in_progress', 'completed', 'cancelled']),
  ],
  updateTask
);

/**
 * @openapi
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task deleted
 */
router.delete('/:id', deleteTask);

export default router;
