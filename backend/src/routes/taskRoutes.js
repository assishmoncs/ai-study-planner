const express = require('express');
const { body } = require('express-validator');
const { createTask, getTasks, getTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(
    [
      body('title').trim().notEmpty().withMessage('Task title is required'),
      body('estimatedMinutes').optional().isInt({ min: 1 }).withMessage('Estimated minutes must be a positive integer'),
    ],
    createTask
  );

router
  .route('/:id')
  .get(getTask)
  .patch(updateTask)
  .delete(deleteTask);

module.exports = router;
