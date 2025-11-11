// backend/models/Institute.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const instituteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Institute name is required'],
    trim: true,
    maxlength: [200, 'Institute name cannot be more than 200 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  category: {
    type: String,
    required: [true, 'Institute category is required'],
    enum: {
      values: ['school', 'college', 'coaching', 'preschool', 'university', 'vocational'],
      message: 'Invalid institute category'
    }
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot be more than 2000 characters'],
    default: ''
  },
  website: {
    type: String,
    match: [/^https?:\/\/.+\..+/, 'Please enter a valid website URL']
  },
  contact: {
    email: {
      type: String,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    alternatePhone: String
  },
  address: {
    street: String,
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    pincode: {
      type: String,
      match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
    },
    country: {
      type: String,
      default: 'India'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  facilities: [{
    type: String,
    maxlength: [100, 'Facility name cannot be more than 100 characters']
  }],
  photos: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  socialMedia: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String,
    youtube: String
  },
  establishedYear: {
    type: Number,
    min: [1800, 'Establishment year seems invalid'],
    max: [new Date().getFullYear(), 'Establishment year cannot be in the future']
  },
  accreditation: [{
    body: String,
    certificate: String,
    validUntil: Date
  }],
  stats: {
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    coursesCount: {
      type: Number,
      default: 0,
      min: 0
    },
    enquiriesCount: {
      type: Number,
      default: 0,
      min: 0
    },
    views: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  features: {
    verified: {
      type: Boolean,
      default: false
    },
    featured: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  profileCompletion: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    expiresAt: Date,
    features: [String]
  },
  workingHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    open: String,
    close: String,
    closed: {
      type: Boolean,
      default: false
    }
  }],
  metadata: {
    lastLogin: Date,
    lastProfileUpdate: Date,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Password hashing middleware
instituteSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
instituteSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for formatted rating
instituteSchema.virtual('formattedRating').get(function() {
  return this.stats.rating ? this.stats.rating.toFixed(1) : 'Not rated';
});

// Virtual for institute age
instituteSchema.virtual('age').get(function() {
  if (!this.establishedYear) return null;
  return new Date().getFullYear() - this.establishedYear;
});

// Indexes
instituteSchema.index({ email: 1 });
instituteSchema.index({ 'address.city': 1 });
instituteSchema.index({ category: 1 });
instituteSchema.index({ 'features.verified': 1 });
instituteSchema.index({ 'stats.rating': -1 });
instituteSchema.index({ 'features.featured': -1, createdAt: -1 });

// Static method to find verified institutes
instituteSchema.statics.findVerified = function() {
  return this.find({ 'features.verified': true }).sort({ 'stats.rating': -1 });
};

// Static method to find institutes by city
instituteSchema.statics.findByCity = function(city) {
  return this.find({ 'address.city': new RegExp(city, 'i') });
};

// Instance method to update profile completion
instituteSchema.methods.updateProfileCompletion = function() {
  let completion = 0;
  const fields = [
    this.name && 10,
    this.description && 10,
    this.contact?.email && 5,
    this.contact?.phone && 5,
    this.address?.city && 5,
    this.address?.state && 5,
    this.photos?.length > 0 && 10,
    this.facilities?.length > 0 && 10,
    this.establishedYear && 5,
    this.workingHours?.length > 0 && 10,
    this.accreditation?.length > 0 && 10,
    this.socialMedia && Object.values(this.socialMedia).some(val => val) && 10
  ].filter(Boolean);

  completion = fields.reduce((sum, score) => sum + score, 0);
  this.profileCompletion = Math.min(completion, 100);
  return this.save();
};

// Instance method to increment views
instituteSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save();
};

module.exports = mongoose.model('Institute', instituteSchema);