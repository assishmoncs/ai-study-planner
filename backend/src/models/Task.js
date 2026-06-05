const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studyPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyPlan',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    dueDate: {
      type: Date,
      default: null,
    },
    estimatedMinutes: {
      type: Number,
      default: 30,
      min: [1, 'Estimated minutes must be at least 1'],
    },
    actualMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'completed', 'cancelled'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    tags: [{ type: String, trim: true }],
    pomodoroSessions: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

taskSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

taskSchema.index({ user: 1, status: 1, updatedAt: -1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, studyPlan: 1 });

module.exports = mongoose.model('Task', taskSchema);
