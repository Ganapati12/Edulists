// backend/models/Enquiry.js
const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  course: {
    type: String,
    trim: true,
    maxlength: [100, 'Course name cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters'],
    minlength: [10, 'Message must be at least 10 characters long']
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    required: [true, 'Institute reference is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'replied', 'resolved', 'cancelled'],
      message: 'Invalid enquiry status'
    },
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  source: {
    type: String,
    enum: ['website', 'phone', 'email', 'walk-in', 'referral'],
    default: 'website'
  },
  reply: {
    message: {
      type: String,
      maxlength: [2000, 'Reply cannot be more than 2000 characters']
    },
    repliedAt: Date,
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  followUp: {
    scheduledAt: Date,
    notes: String,
    completed: {
      type: Boolean,
      default: false
    }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    pageUrl: String,
    campaign: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
enquirySchema.index({ institute: 1, createdAt: -1 });
enquirySchema.index({ email: 1 });
enquirySchema.index({ status: 1 });
enquirySchema.index({ 'followUp.scheduledAt': 1 });

// Virtual for formatted created date
enquirySchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-IN');
});

// Static method to get enquiries by status
enquirySchema.statics.findByStatus = function(status, instituteId = null) {
  const query = { status };
  if (instituteId) {
    query.institute = instituteId;
  }
  return this.find(query).populate('institute', 'name category');
};

// Instance method to mark as replied
enquirySchema.methods.markAsReplied = function(replyMessage, repliedBy) {
  this.status = 'replied';
  this.reply = {
    message: replyMessage,
    repliedAt: new Date(),
    repliedBy: repliedBy
  };
  return this.save();
};

// Instance method to schedule follow-up
enquirySchema.methods.scheduleFollowUp = function(scheduledAt, notes) {
  this.followUp = {
    scheduledAt,
    notes,
    completed: false
  };
  return this.save();
};

module.exports = mongoose.model('Enquiry', enquirySchema);