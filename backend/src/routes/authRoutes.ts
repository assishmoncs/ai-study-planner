import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getProfile,
  updateProfile,
  refresh,
  logout,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimiters';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, maxLength: 100, example: Jane Doe }
 *               email: { type: string, format: email, example: jane@example.com }
 *               password: { type: string, minLength: 8, example: secret123 }
 *     responses:
 *       201:
 *         description: Registration successful
 *       409:
 *         description: Email already registered
 */
router.post(
  '/register',
  authLimiter,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters'),
  ],
  register
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using HttpOnly refresh cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Invalid or missing refresh token
 */
router.post('/refresh', authLimiter, refresh);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Log out the current user and revoke refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', logout);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Not authorized
 */
router.get('/me', protect, getProfile);

/**
 * @openapi
 * /api/auth/me:
 *   patch:
 *     summary: Update current user profile and preferences
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, maxLength: 100 }
 *               avatar: { type: string }
 *               preferences:
 *                 type: object
 *                 properties:
 *                   studyHoursPerDay: { type: number, minimum: 0.5, maximum: 24 }
 *                   preferredStudyTime: { type: string, enum: [morning, afternoon, evening, night] }
 *                   pomodoroLength: { type: integer, minimum: 1, maximum: 120 }
 *                   breakLength: { type: integer, minimum: 1, maximum: 60 }
 *                   timezone: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch(
  '/me',
  protect,
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('preferences.studyHoursPerDay')
      .optional()
      .isFloat({ min: 0.5, max: 24 })
      .withMessage('Study hours per day must be between 0.5 and 24'),
    body('preferences.preferredStudyTime')
      .optional()
      .isIn(['morning', 'afternoon', 'evening', 'night'])
      .withMessage('Invalid preferred study time'),
    body('preferences.pomodoroLength')
      .optional()
      .isInt({ min: 1, max: 120 })
      .withMessage('Pomodoro length must be between 1 and 120 minutes'),
    body('preferences.breakLength')
      .optional()
      .isInt({ min: 1, max: 60 })
      .withMessage('Break length must be between 1 and 60 minutes'),
  ],
  updateProfile
);

export default router;
