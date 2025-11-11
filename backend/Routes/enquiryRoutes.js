// backend/routes/enquiries.js
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getEnquiries,
  getEnquiryById,
  createEnquiry,
  replyEnquiry,
  updateEnquiryStatus,
  deleteEnquiry,
  getEnquiryStats
} from '../controllers/enquiryController.js';

const router = express.Router();

// Public route - anyone can create an enquiry
router.post('/', createEnquiry);

// Protected routes
router.use(protect);
router.get('/', authorize('institute', 'admin'), getEnquiries);
router.get('/stats', authorize('institute', 'admin'), getEnquiryStats);
router.get('/:id', authorize('institute', 'admin'), getEnquiryById);
router.put('/:id/reply', authorize('institute', 'admin'), replyEnquiry);
router.put('/:id/status', authorize('institute', 'admin'), updateEnquiryStatus);
router.delete('/:id', authorize('institute', 'admin'), deleteEnquiry);

export default router;