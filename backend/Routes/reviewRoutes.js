// backend/routes/reviews.js
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  flagReview,
  approveReview,
  deleteReview,
  getReviewStats
} from '../controllers/reviewController.js';

const router = express.Router();

// Public routes
router.get('/', getReviews);
router.get('/stats', getReviewStats);

// Protected routes
router.use(protect);
router.post('/', createReview);
router.get('/:id', getReviewById);
router.put('/:id', updateReview);
router.put('/:id/flag', authorize('institute', 'admin'), flagReview);
router.put('/:id/approve', authorize('admin'), approveReview);
router.delete('/:id', deleteReview);

export default router;