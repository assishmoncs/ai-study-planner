import { Router } from 'express';
import { body } from 'express-validator';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController';
import { protect } from '../middleware/authMiddleware';
import { userLimiter } from '../middleware/rateLimiters';

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
 *               title: { type: string }
 *               description: { type: string }
 *               dueDate: { type: string, format: date-time }
 *               estimatedMinutes: { type: integer, minimum: 1 }
 *               priority: { type: string, enum: [low, medium, high, urgent] }
 *               studyPlan: { type: string }
 *     responses:
 *       201:
 *         description: Task created
 */
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('estimatedMinutes')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Estimated minutes must be a positive integer'),
  ],
  createTask
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
router.patch('/:id', updateTask);

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
