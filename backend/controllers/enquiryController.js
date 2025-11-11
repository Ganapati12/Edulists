import Enquiry from '../models/Enquiry.js';

const getEnquiries = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      institute, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};
    
    // Filter by institute (for institute users)
    if (req.user.role === 'institute') {
      query.institute = req.user.institute;
    } else if (institute) {
      query.institute = institute;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const enquiries = await Enquiry.find(query)
      .populate('institute', 'name category')
      .populate('user', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortConfig);

    const total = await Enquiry.countDocuments(query);

    // Get status counts for filters
    const statusCounts = await Enquiry.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, { pending: 0, replied: 0, resolved: 0 });

    res.json({
      success: true,
      enquiries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      filters: {
        status: statusStats
      },
      message: 'Enquiries fetched successfully'
    });
  } catch (error) {
    console.error('Get enquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enquiries'
    });
  }
};

const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id)
      .populate('institute', 'name category contact address')
      .populate('user', 'name email phone');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    // Check if user has permission to view this enquiry
    if (req.user.role === 'institute' && enquiry.institute._id.toString() !== req.user.institute.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this enquiry'
      });
    }

    res.json({
      success: true,
      enquiry,
      message: 'Enquiry fetched successfully'
    });
  } catch (error) {
    console.error('Get enquiry by ID error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching enquiry'
    });
  }
};

const createEnquiry = async (req, res) => {
  try {
    const { name, email, phone, course, message, institute } = req.body;

    // Validation
    if (!name || !email || !message || !institute) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, message, and institute are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    const enquiry = await Enquiry.create({
      name,
      email: email.toLowerCase(),
      phone,
      course,
      message,
      institute,
      ...(req.user && { user: req.user.id })
    });

    // Populate institute data
    await enquiry.populate('institute', 'name category contact');

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      enquiry,
      notification: 'We have received your enquiry and will get back to you soon.'
    });
  } catch (error) {
    console.error('Create enquiry error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error submitting enquiry'
    });
  }
};

const replyEnquiry = async (req, res) => {
  try {
    const { reply, status = 'replied' } = req.body;

    if (!reply || reply.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    // Check permissions
    if (req.user.role === 'institute' && enquiry.institute.toString() !== req.user.institute.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this enquiry'
      });
    }

    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      {
        reply: reply.trim(),
        status,
        repliedAt: new Date(),
        repliedBy: req.user.id,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('institute', 'name')
     .populate('user', 'name email')
     .populate('repliedBy', 'name');

    res.json({
      success: true,
      message: 'Reply sent successfully',
      enquiry: updatedEnquiry
    });
  } catch (error) {
    console.error('Reply enquiry error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error sending reply'
    });
  }
};

const updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'replied', 'resolved', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    // Check permissions
    if (req.user.role === 'institute' && enquiry.institute.toString() !== req.user.institute.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this enquiry'
      });
    }

    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      {
        status,
        updatedAt: new Date(),
        ...(status === 'resolved' && { resolvedAt: new Date() })
      },
      { new: true }
    ).populate('institute', 'name')
     .populate('user', 'name email');

    res.json({
      success: true,
      message: `Enquiry marked as ${status}`,
      enquiry: updatedEnquiry
    });
  } catch (error) {
    console.error('Update enquiry status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating enquiry status'
    });
  }
};

const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    // Check permissions
    if (req.user.role === 'institute' && enquiry.institute.toString() !== req.user.institute.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this enquiry'
      });
    }

    await Enquiry.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Enquiry deleted successfully'
    });
  } catch (error) {
    console.error('Delete enquiry error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting enquiry'
    });
  }
};

const getEnquiryStats = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'institute') {
      query.institute = req.user.institute;
    }

    const stats = await Enquiry.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Enquiry.countDocuments(query);

    // Convert to object format
    const statusStats = {
      pending: 0,
      replied: 0,
      resolved: 0,
      cancelled: 0,
      total
    };

    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    // Recent enquiries (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentCount = await Enquiry.countDocuments({
      ...query,
      createdAt: { $gte: oneWeekAgo }
    });

    res.json({
      success: true,
      stats: statusStats,
      recentActivity: {
        last7Days: recentCount,
        responseRate: total > 0 ? ((statusStats.replied + statusStats.resolved) / total * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Get enquiry stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enquiry statistics'
    });
  }
};

export { 
  getEnquiries, 
  getEnquiryById, 
  createEnquiry, 
  replyEnquiry, 
  updateEnquiryStatus,
  deleteEnquiry,
  getEnquiryStats
};