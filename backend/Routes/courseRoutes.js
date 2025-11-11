// backend/routes/courses.js
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCoursesByInstitute
} from '../controllers/courseController.js';

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/institute/:instituteId', getCoursesByInstitute);
router.get('/:id', getCourseById);

// Protected routes
router.use(protect);
router.post('/', authorize('institute', 'admin'), createCourse);
router.put('/:id', authorize('institute', 'admin'), updateCourse);
router.delete('/:id', authorize('institute', 'admin'), deleteCourse);

export default router;