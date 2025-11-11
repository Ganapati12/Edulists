const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Course title cannot be more than 100 characters'],
    minlength: [3, 'Course title must be at least 3 characters long']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters'],
    minlength: [10, 'Description must be at least 10 characters long']
  },
  duration: {
    type: String,
    required: [true, 'Course duration is required'],
    trim: true,
    maxlength: [50, 'Duration cannot be more than 50 characters']
  },
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: [0, 'Price cannot be negative'],
    set: value => Math.round(value * 100) / 100 // Store with 2 decimal places
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative'],
    set: value => Math.round(value * 100) / 100
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    required: [true, 'Institute reference is required']
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    enum: {
      values: [
        'academic', 'competitive', 'vocational', 'professional', 
        'language', 'arts', 'sports', 'technology', 'business',
        'healthcare', 'engineering', 'law', 'other'
      ],
      message: 'Invalid course category'
    }
  },
  level: {
    type: String,
    enum: {
      values: ['beginner', 'intermediate', 'advanced', 'all-levels'],
      message: 'Invalid course level'
    },
    default: 'all-levels'
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'draft', 'archived', 'suspended'],
      message: 'Invalid course status'
    },
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  enrollmentCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxEnrollments: {
    type: Number,
    min: 1,
    default: 100
  },
  curriculum: [{
    moduleTitle: {
      type: String,
      required: true,
      maxlength: [100, 'Module title cannot be more than 100 characters']
    },
    moduleDescription: {
      type: String,
      maxlength: [500, 'Module description cannot be more than 500 characters']
    },
    duration: String,
    topics: [String],
    resources: [{
      title: String,
      type: {
        type: String,
        enum: ['video', 'pdf', 'document', 'link', 'quiz']
      },
      url: String
    }]
  }],
  requirements: [{
    type: String,
    maxlength: [200, 'Requirement cannot be more than 200 characters']
  }],
  learningOutcomes: [{
    type: String,
    maxlength: [200, 'Learning outcome cannot be more than 200 characters']
  }],
  tags: [{
    type: String,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  schedule: {
    startDate: Date,
    endDate: Date,
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    timing: String,
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  deliveryMode: {
    type: String,
    enum: ['online', 'offline', 'hybrid'],
    default: 'offline'
  },
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  instructor: {
    name: String,
    qualification: String,
    experience: String,
    bio: String,
    avatar: String
  },
  reviews: {
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  metadata: {
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    lastEnrollment: Date,
    completionRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted price
courseSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price?.toLocaleString('en-IN')}`;
});

// Virtual for discount percentage
courseSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for enrollment availability
courseSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.enrollmentCount < this.maxEnrollments;
});

// Virtual for course duration in weeks (if duration is in format like "3 months", "12 weeks")
courseSchema.virtual('durationInWeeks').get(function() {
  if (!this.duration) return null;
  
  const match = this.duration.match(/(\d+)\s*(month|week|year)s?/i);
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'week': return value;
      case 'month': return value * 4;
      case 'year': return value * 52;
      default: return value;
    }
  }
  return null;
});

// Indexes for better query performance
courseSchema.index({ institute: 1, createdAt: -1 });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ price: 1 });
courseSchema.index({ 'reviews.averageRating': -1 });
courseSchema.index({ featured: -1, createdAt: -1 });
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Static method to get courses by institute
courseSchema.statics.findByInstitute = function(instituteId, options = {}) {
  const { status = 'active', limit = 10, page = 1 } = options;
  
  return this.find({ 
    institute: instituteId, 
    status 
  })
  .limit(limit)
  .skip((page - 1) * limit)
  .sort({ createdAt: -1 })
  .populate('institute', 'name category');
};

// Static method to get featured courses
courseSchema.statics.getFeaturedCourses = function(limit = 8) {
  return this.find({ 
    featured: true, 
    status: 'active' 
  })
  .limit(limit)
  .sort({ 'reviews.averageRating': -1, createdAt: -1 })
  .populate('institute', 'name category rating');
};

// Instance method to check if course is full
courseSchema.methods.isFull = function() {
  return this.enrollmentCount >= this.maxEnrollments;
};

// Instance method to increment enrollment
courseSchema.methods.incrementEnrollment = function() {
  if (this.enrollmentCount < this.maxEnrollments) {
    this.enrollmentCount += 1;
    this.metadata.lastEnrollment = new Date();
    return this.save();
  }
  throw new Error('Course is full');
};

// Instance method to update rating
courseSchema.methods.updateRating = async function(newRating) {
  const totalScore = this.reviews.averageRating * this.reviews.totalReviews + newRating;
  this.reviews.totalReviews += 1;
  this.reviews.averageRating = totalScore / this.reviews.totalReviews;
  return this.save();
};

// Middleware to set original price if not provided
courseSchema.pre('save', function(next) {
  if (!this.originalPrice) {
    this.originalPrice = this.price;
  }
  
  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length > 1) {
      // Keep only the first one as primary
      this.images.forEach((img, index) => {
        img.isPrimary = index === 0;
      });
    }
  }
  
  next();
});

// Middleware to update institute's course count (you'll need to implement this in Institute model)
courseSchema.post('save', async function() {
  // This would update the institute's course count
  // You'll need to implement this based on your Institute model
});

courseSchema.post('findOneAndDelete', async function() {
  // This would update the institute's course count when a course is deleted
});

module.exports = mongoose.model('Course', courseSchema);