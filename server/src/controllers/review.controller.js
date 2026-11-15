import Review from '../models/Review.js';
import Project from '../models/Project.js';
import { createReview } from '../services/review.service.js';
import { normalizeSource } from '../services/file.service.js';

export async function listReviews(req, res) {
  const reviews = await Review.find({
    owner: req.user._id
  })
    .populate('project', 'name')
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({ reviews });
}

export async function runReview(req, res) {
  const project = await Project.findOne({
    _id: req.params.projectId,
    owner: req.user._id
  });

  if (!project) {
    return res.status(404).json({
      message: 'Project not found'
    });
  }

  const inputs = req.files?.length
    ? req.files.map(file => ({ source: file.buffer.toString('utf8'), filename: file.originalname }))
    : [req.body || {}];
  const reviews = [];
  for (const input of inputs) {
    const { source, filename } = normalizeSource(input);
    reviews.push(await createReview(req.user, project._id, { source, filename }));
  }

  res.status(201).json({ review: reviews[0], reviews });
}

export async function getReview(req, res) {
  const review = await Review.findOne({
    _id: req.params.id,
    owner: req.user._id
  }).populate('project', 'name');

  if (!review) {
    return res.status(404).json({
      message: 'Review not found'
    });
  }

  res.json({ review });
}
