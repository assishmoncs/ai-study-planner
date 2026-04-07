const express = require('express');
const { body } = require('express-validator');
const {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
  deletePlan,
  logHours,
  getAISuggestions,
} = require('../controllers/studyPlanController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getPlans)
  .post(
    [
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('subject').trim().notEmpty().withMessage('Subject is required'),
      body('startDate').isISO8601().withMessage('Valid start date is required'),
      body('endDate').isISO8601().withMessage('Valid end date is required'),
      body('targetHours').isFloat({ min: 0.5 }).withMessage('Target hours must be at least 0.5'),
    ],
    createPlan
  );

router
  .route('/:id')
  .get(getPlan)
  .patch(updatePlan)
  .delete(deletePlan);

router.post('/:id/log-hours', logHours);
router.post('/ai/suggest', getAISuggestions);

module.exports = router;
