import mongoose from 'mongoose';

const issue = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      default: ''
    },

    suggestion: {
      type: String,
      default: ''
    },

    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'low'
    },

    category: {
      type: String,
      default: 'quality'
    },

    file: {
      type: String,
      default: 'source'
    },

    line: {
      type: Number,
      default: null
    }
  },
  {
    _id: false
  }
);

const reviewSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    filename: {
      type: String,
      default: 'snippet.js'
    },

    fixedSource: {
      type: String,
      default: ''
    },

    summary: {
      type: String,
      default: ''
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },

    issues: [issue],

    durationMs: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Review = mongoose.model('Review', reviewSchema);

export default Review;
