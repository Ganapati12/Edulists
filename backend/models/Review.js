// backend/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    required: [true, 'Institute reference is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters'],
    minlength: [10, 'Comment must be at least 10 characters long']
  },
  approved: {
    type: Boolean,
    default: false
  },
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String,
    maxlength: [500, 'Flag reason cannot be more than 500 characters']
  },
  flaggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  flaggedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  helpful: {
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  response: {
    message: {
      type: String,
      maxlength: [1000, 'Response cannot be more than 1000 characters']
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    edited: {
      type: Boolean,
      default: false
    },
    lastEdited: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one review per user per institute
reviewSchema.index({ user: 1, institute: 1 }, { unique: true });

// Indexes for better performance
reviewSchema.index({ institute: 1, createdAt: -1 });
reviewSchema.index({ approved: 1, flagged: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ 'helpful.count': -1 });

// Virtual for formatted date
reviewSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for time ago
reviewSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return this.formattedDate;
});

// Static method to get approved reviews for institute
reviewSchema.statics.getApprovedReviews = function(instituteId, limit = 10) {
  return this.find({
    institute: instituteId,
    approved: true,
    flagged: false
  })
  .populate('user', 'name avatar')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(instituteId) {
  const result = await this.aggregate([
    {
      $match: {
        institute: instituteId,
        approved: true
      }
    },
    {
      $group: {
        _id: '$institute',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  return result[0] || { averageRating: 0, totalReviews: 0 };
};

// Instance method to mark as helpful
reviewSchema.methods.markHelpful = function(userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove helpful mark
reviewSchema.methods.removeHelpful = function(userId) {
  const userIndex = this.helpful.users.indexOf(userId);
  if (userIndex > -1) {
    this.helpful.users.splice(userIndex, 1);
    this.helpful.count -= 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to flag review
reviewSchema.methods.flag = function(reason, flaggedBy) {
  this.flagged = true;
  this.flagReason = reason;
  this.flaggedBy = flaggedBy;
  this.flaggedAt = new Date();
  this.approved = false; // Unapprove when flagged
  return this.save();
};

// Instance method to approve review
reviewSchema.methods.approve = function(approvedBy) {
  this.approved = true;
  this.flagged = false;
  this.flagReason = undefined;
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  return this.save();
};

// Instance method to add response
reviewSchema.methods.addResponse = function(message, respondedBy) {
  this.response = {
    message,
    respondedBy,
    respondedAt: new Date()
  };
  return this.save();
};

// Middleware to update institute rating when review is saved
reviewSchema.post('save', async function() {
  if (this.approved) {
    const Institute = mongoose.model('Institute');
    const stats = await this.constructor.calculateAverageRating(this.institute);
    
    await Institute.findByIdAndUpdate(this.institute, {
      'stats.rating': Math.round(stats.averageRating * 10) / 10,
      'stats.reviewsCount': stats.totalReviews
    });
  }
});

reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc && doc.approved) {
    const Institute = mongoose.model('Institute');
    const stats = await doc.constructor.calculateAverageRating(doc.institute);
    
    await Institute.findByIdAndUpdate(doc.institute, {
      'stats.rating': Math.round(stats.averageRating * 10) / 10,
      'stats.reviewsCount': stats.totalReviews
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);