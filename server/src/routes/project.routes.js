import { Router } from 'express';
import {
  listProjects,
  createProject,
  getProject,
  deleteProject
} from '../controllers/project.controller.js';
import protect from '../middleware/protect.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);
router.route('/').get(asyncHandler(listProjects)).post(asyncHandler(createProject));
router.route('/:id').get(asyncHandler(getProject)).delete(asyncHandler(deleteProject));

export default router;
