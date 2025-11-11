// Add this to your server.js or create a separate dashboard route file
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getDashboardData, getInstituteStats, getPlatformStats } from '../controllers/dashboardController.js';

const router = express.Router();

router.use(protect);

// Main dashboard endpoint
router.get('/', getDashboardData);

// Institute-specific stats
router.get('/stats/institute', authorize('institute', 'admin'), getInstituteStats);

// Platform-wide stats (admin only)
router.get('/stats/platform', authorize('admin'), getPlatformStats);

export default router;