const Review = require('../models/Review');
const Institute = require('../models/Institute');

const getReviews = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      institute, 
      user,
      status = 'approved',
      rating,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build query
    let query = {};
    
    // Filter by institute
    if (institute) {
      query.institute = institute;
    } else if (req.user?.role === 'institute' && req.user.institute) {
      query.institute = req.user.institute;
    }
    
    // Filter by user
    if (user) {
      query.user = user;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      if (status === 'flagged') {
        query.flagged = true;
      } else if (status === 'pending') {
        query.approved = false;
      } else if (status === 'approved') {
        query.approved = true;
        query.flagged = false;
      }
    }
    
    // Filter by rating
    if (rating) {
      query.rating = parseInt(rating);
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { comment: { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .populate('institute', 'name category')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortConfig);

    const total = await Review.countDocuments(query);

    // Get rating distribution and stats
    const ratingStats = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const statusStats = await Review.aggregate([
      { $match: { institute: query.institute } },
      {
        $group: {
          _id: {
            approved: '$approved',
            flagged: '$flagged'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      statistics: {
        ratingDistribution: ratingStats,
        averageRating: await calculateAverageRating(query),
        totalReviews: total
      },
      message: 'Reviews fetched successfully'
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews'
    });
  }
};

const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate('institute', 'name category contact');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check permissions for institute users
    if (req.user?.role === 'institute' && review.institute._id.toString() !== req.user.institute.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this review'
      });
    }

    res.json({
      success: true,
      review,
      message: 'Review fetched successfully'
    });
  } catch (error) {
    console.error('Get review by ID error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching review'
    });
  }
};

const createReview = async (req, res) => {
  try {
    const { institute, rating, comment } = req.body;

    // Validation
    if (!institute || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Institute, rating, and comment are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (comment.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be at least 10 characters long'
      });
    }

    // Check if user already reviewed this institute
    const existingReview = await Review.findOne({
      user: req.user.id,
      institute
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this institute'
      });
    }

    // Check if institute exists
    const instituteExists = await Institute.findById(institute);
    if (!instituteExists) {
      return res.status(404).json({
        success: false,
        message: 'Institute not found'
      });
    }

    const review = await Review.create({
      user: req.user.id,
      institute,
      rating: parseInt(rating),
      comment: comment.trim(),
      approved: req.user.role === 'admin' // Auto-approve for admins
    });

    // Populate data for response
    await review.populate('user', 'name avatar');
    await review.populate('institute', 'name category');

    // Update institute rating
    await updateInstituteRating(institute);

    res.status(201).json({
      success: true,
      message: req.user.role === 'admin' ? 'Review submitted successfully' : 'Review submitted and pending approval',
      review,
      requiresApproval: req.user.role !== 'admin'
    });
  } catch (error) {
    console.error('Create review error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error submitting review'
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check permissions - only review owner or admin can update
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to update this review'
      });
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
      updateData.rating = parseInt(rating);
    }

    if (comment !== undefined) {
      if (comment.length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Comment must be at least 10 characters long'
        });
      }
      updateData.comment = comment.trim();
      // If comment is updated, it might need re-approval
      if (req.user.role !== 'admin') {
        updateData.approved = false;
      }
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name avatar')
     .populate('institute', 'name category');

    // Update institute rating if rating changed
    if (rating !== undefined) {
      await updateInstituteRating(review.institute);
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview,
      requiresApproval: req.user.role !== 'admin' && comment !== undefined
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review'
    });
  }
};

const flagReview = async (req, res) => {
  try {
    const { flag, reason } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check permissions - institute owners can only flag reviews for their institute
    if (req.user.role === 'institute' && review.institute.toString() !== req.user.institute.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to flag this review'
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      {
        flagged: flag,
        flagReason: flag ? reason : undefined,
        flaggedAt: flag ? new Date() : undefined,
        flaggedBy: flag ? req.user.id : undefined,
        approved: flag ? false : review.approved // Unapprove when flagged
      },
      { new: true }
    ).populate('user', 'name avatar')
     .populate('institute', 'name category')
     .populate('flaggedBy', 'name');

    res.json({
      success: true,
      message: flag ? 'Review flagged successfully' : 'Review unflagged successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Flag review error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating review flag status'
    });
  }
};

const approveReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only admins can approve reviews
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can approve reviews'
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      {
        approved: true,
        flagged: false, // Unflag when approving
        flagReason: undefined,
        approvedAt: new Date(),
        approvedBy: req.user.id
      },
      { new: true }
    ).populate('user', 'name avatar')
     .populate('institute', 'name category')
     .populate('approvedBy', 'name');

    // Update institute rating
    await updateInstituteRating(review.institute);

    res.json({
      success: true,
      message: 'Review approved successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving review'
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check permissions - review owner, institute owner, or admin can delete
    const isOwner = review.user.toString() === req.user.id;
    const isInstituteOwner = req.user.role === 'institute' && review.institute.toString() === req.user.institute.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isInstituteOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to delete this review'
      });
    }

    const instituteId = review.institute;
    await Review.findByIdAndDelete(req.params.id);

    // Update institute rating
    await updateInstituteRating(instituteId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting review'
    });
  }
};

const getReviewStats = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'institute' && req.user.institute) {
      query.institute = req.user.institute;
    }

    const stats = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          approvedReviews: { $sum: { $cond: ['$approved', 1, 0] } },
          pendingReviews: { $sum: { $cond: [{ $and: ['$approved', { $not: '$approved' }] }, 1, 0] } },
          flaggedReviews: { $sum: { $cond: ['$flagged', 1, 0] } }
        }
      }
    ]);

    const ratingDistribution = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const result = stats[0] || {
      totalReviews: 0,
      averageRating: 0,
      approvedReviews: 0,
      pendingReviews: 0,
      flaggedReviews: 0
    };

    res.json({
      success: true,
      stats: {
        ...result,
        averageRating: Math.round(result.averageRating * 10) / 10 || 0,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review statistics'
    });
  }
};

// Helper functions
const calculateAverageRating = async (query) => {
  const result = await Review.aggregate([
    { $match: { ...query, approved: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' }
      }
    }
  ]);
  return result[0] ? Math.round(result[0].averageRating * 10) / 10 : 0;
};

const updateInstituteRating = async (instituteId) => {
  try {
    const reviews = await Review.find({ 
      institute: instituteId, 
      approved: true 
    });
    
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    await Institute.findByIdAndUpdate(instituteId, {
      rating: Math.round(averageRating * 10) / 10,
      reviewsCount: reviews.length,
      lastRatingUpdate: new Date()
    });
  } catch (error) {
    console.error('Update institute rating error:', error);
  }
};

module.exports = { 
  getReviews, 
  getReviewById, 
  createReview, 
  updateReview,
  flagReview, 
  approveReview,
  deleteReview,
  getReviewStats 
};