import multer from 'multer';
import fileFilter from '../utils/fileFilter.js';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024, files: 4 },
  fileFilter
});
