import { Router } from 'express';

import {
  listReviews,
  runReview,
  getReview
} from '../controllers/review.controller.js';

import protect from '../middleware/protect.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Protect all review routes
router.use(protect);

// GET all reviews
router.get('/', listReviews);

// POST run code review
router.post(
  '/:projectId',
  upload.array('files', 4),
  runReview
);

// GET single review
router.get('/:id', getReview);

export default router;
