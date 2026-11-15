import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },

    description: {
      type: String,
      default: ''
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    reviewCount: {
      type: Number,
      default: 0
    },

    issueCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

projectSchema.index({ owner: 1, updatedAt: -1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;