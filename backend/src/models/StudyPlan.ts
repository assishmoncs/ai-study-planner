import mongoose, { Schema } from 'mongoose';
import type { IStudyPlan } from '../types/index';

const studyPlanSchema = new Schema<IStudyPlan>(
  {
    user: {
      type: Schema.Types.ObjectId,
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
      validate: {
        validator: (value: string) => /^#([0-9a-fA-F]{3}){1,2}$/.test(value),
        message: 'Color must be a valid hex code',
      },
    },
  },
  { timestamps: true }
);

studyPlanSchema.virtual('progressPercent').get(function () {
  const target = (this.targetHours as unknown as number) || 0;
  const completed = (this.completedHours as unknown as number) || 0;
  if (!target) return 0;
  return Math.min(Math.round((completed / target) * 100), 100);
});

studyPlanSchema.set('toJSON', { virtuals: true });
studyPlanSchema.set('toObject', { virtuals: true });
studyPlanSchema.index({ user: 1, status: 1, updatedAt: -1 });
studyPlanSchema.index({ user: 1, subject: 1 });

export default mongoose.model<IStudyPlan>('StudyPlan', studyPlanSchema);
