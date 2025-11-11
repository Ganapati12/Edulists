import Course from '../models/Course.js';

const getCourses = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { institute, page = 1, limit = 10, search } = req.query;
    
    let query = {};
    
    // Filter by institute if provided
    if (institute) {
      query.institute = institute;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .populate('institute', 'name category');

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      message: 'Courses fetched successfully'
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('institute', 'name category address contact');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      course,
      message: 'Course fetched successfully'
    });
  } catch (error) {
    console.error('Get course by ID error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching course'
    });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, description, duration, price, institute } = req.body;

    // Validation
    if (!title || !description || !duration || !price) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, duration, and price are required'
      });
    }

    const course = await Course.create({
      title,
      description,
      duration,
      price: parseFloat(price),
      institute: institute || req.user?.institute
    });

    // Populate institute data in response
    await course.populate('institute', 'name category');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating course'
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { title, description, duration, price, status } = req.body;

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(description && { description }),
        ...(duration && { duration }),
        ...(price && { price: parseFloat(price) }),
        ...(status && { status }),
        updatedAt: Date.now()
      },
      { 
        new: true,
        runValidators: true 
      }
    ).populate('institute', 'name category');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating course'
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting course'
    });
  }
};

// Get courses by institute
const getCoursesByInstitute = async (req, res) => {
  try {
    const { instituteId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const courses = await Course.find({ institute: instituteId })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .populate('institute', 'name category');

    const total = await Course.countDocuments({ institute: instituteId });

    res.json({
      success: true,
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      message: 'Institute courses fetched successfully'
    });
  } catch (error) {
    console.error('Get courses by institute error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching institute courses'
    });
  }
};

export { 
  getCourses, 
  getCourseById, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  getCoursesByInstitute
};