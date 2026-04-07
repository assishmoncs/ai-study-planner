const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Study plan title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    targetHours: {
      type: Number,
      required: [true, 'Target hours are required'],
      min: [0.5, 'Target hours must be at least 0.5'],
    },
    completedHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'archived'],
      default: 'active',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    tags: [{ type: String, trim: true }],
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    aiSuggestions: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
  },
  { timestamps: true }
);

studyPlanSchema.virtual('progressPercent').get(function () {
  if (!this.targetHours) return 0;
  return Math.min(Math.round((this.completedHours / this.targetHours) * 100), 100);
});

studyPlanSchema.set('toJSON', { virtuals: true });
studyPlanSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
