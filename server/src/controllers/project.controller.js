import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Review from '../models/Review.js';

function validId(id) {
  return mongoose.isValidObjectId(id);
}

export async function listProjects(req, res) {
  const projects = await Project.find({ owner: req.user._id })
    .sort({ updatedAt: -1 })
    .lean();

  return res.json({ projects });
}

export async function createProject(req, res) {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const description = typeof req.body?.description === 'string'
    ? req.body.description.trim().slice(0, 300)
    : '';

  if (name.length < 2 || name.length > 80) {
    return res.status(400).json({
      message: 'Project name must be between 2 and 80 characters.'
    });
  }

  const project = await Project.create({
    name,
    description,
    owner: req.user._id
  });

  return res.status(201).json({ project });
}

export async function getProject(req, res) {
  const { id } = req.params;
  if (!validId(id)) {
    return res.status(400).json({ message: 'Invalid project ID.' });
  }

  const project = await Project.findOne({
    _id: id,
    owner: req.user._id
  }).lean();

  if (!project) {
    return res.status(404).json({ message: 'Project not found.' });
  }

  const latestReview = await Review.findOne({
    project: project._id,
    owner: req.user._id
  })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({ project, latestReview });
}

export async function deleteProject(req, res) {
  const { id } = req.params;
  if (!validId(id)) {
    return res.status(400).json({ message: 'Invalid project ID.' });
  }

  const project = await Project.findOne({
    _id: id,
    owner: req.user._id
  });

  if (!project) {
    return res.status(404).json({ message: 'Project not found.' });
  }

  await Review.deleteMany({ project: project._id, owner: req.user._id });
  await project.deleteOne();

  return res.json({ message: 'Project deleted.' });
}
