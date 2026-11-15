import Project from '../models/Project.js';
import Review from '../models/Review.js';               

export async function createReview(
  user,
  projectId,
  { source, filename = 'snippet.js' }
) {
  const project = await Project.findOne({
    _id: projectId,
    owner: user._id
  });

  if (!project) {
    const e = new Error('Project not found');
    e.statusCode = 404;
    throw e;
  }

  const started = Date.now();

  const { analyzeCode } = await import('./analysis.service.js');

  const result = await analyzeCode(source, filename);

  const review = await Review.create({
    project: project._id,
    owner: user._id,
    filename,
    fixedSource: result.fixedSource,
    summary: result.summary,
    score: result.score,
    issues: result.issues,
    durationMs: Date.now() - started
  });

  project.reviewCount += 1;
  project.issueCount += result.issues.length;
  project.updatedAt = new Date();

  await project.save();

  return review;
}
