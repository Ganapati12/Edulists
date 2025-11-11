const Institute = require('../models/Institute');
const Course = require('../models/Course');
const Enquiry = require('../models/Enquiry');
const Review = require('../models/Review');
const User = require('../models/User');

const getDashboardData = async (req, res) => {
  try {
    const instituteId = req.user?.institute || req.institute?._id;
    const userRole = req.user?.role;

    let dashboardData = {};

    if (userRole === 'admin') {
      // Admin dashboard - platform-wide statistics
      dashboardData = await getAdminDashboard();
    } else if (userRole === 'institute' && instituteId) {
      // Institute dashboard - specific institute statistics
      dashboardData = await getInstituteDashboard(instituteId);
    } else {
      // User dashboard or general dashboard
      dashboardData = await getUserDashboard(req.user?.id);
    }

    res.json({
      success: true,
      message: 'Dashboard data fetched successfully',
      ...dashboardData
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
};

// Admin dashboard - platform statistics
const getAdminDashboard = async () => {
  try {
    const [
      totalInstitutes,
      totalUsers,
      totalCourses,
      totalEnquiries,
      totalReviews,
      pendingInstitutes,
      recentInstitutes,
      recentUsers
    ] = await Promise.all([
      Institute.countDocuments(),
      User.countDocuments(),
      Course.countDocuments(),
      Enquiry.countDocuments(),
      Review.countDocuments(),
      Institute.countDocuments({ verified: false }),
      Institute.find().sort({ createdAt: -1 }).limit(5),
      User.find().sort({ createdAt: -1 }).limit(5)
    ]);

    // Calculate platform rating
    const reviews = await Review.find();
    const avgPlatformRating = reviews.length > 0 
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : 0;

    return {
      role: 'admin',
      stats: {
        totalInstitutes,
        totalUsers,
        totalCourses,
        totalEnquiries,
        totalReviews,
        pendingInstitutes,
        avgPlatformRating: parseFloat(avgPlatformRating)
      },
      recentActivity: {
        newInstitutes: recentInstitutes,
        newUsers: recentUsers
      },
      charts: {
        instituteCategories: await getInstituteCategories(),
        monthlyGrowth: await getMonthlyGrowth()
      }
    };
  } catch (error) {
    throw new Error('Failed to fetch admin dashboard data');
  }
};

// Institute dashboard - specific institute statistics
const getInstituteDashboard = async (instituteId) => {
  try {
    const [
      courses,
      enquiries,
      reviews,
      institute,
      pendingEnquiries,
      recentEnquiries,
      recentReviews
    ] = await Promise.all([
      Course.find({ institute: instituteId }),
      Enquiry.find({ institute: instituteId }),
      Review.find({ institute: instituteId }),
      Institute.findById(instituteId),
      Enquiry.countDocuments({ institute: instituteId, status: 'pending' }),
      Enquiry.find({ institute: instituteId }).sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
      Review.find({ institute: instituteId }).sort({ createdAt: -1 }).limit(5).populate('user', 'name')
    ]);

    // Calculate ratings and statistics
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : 0;

    const ratingDistribution = calculateRatingDistribution(reviews);
    const enquiryStats = calculateEnquiryStats(enquiries);

    return {
      role: 'institute',
      institute: {
        name: institute?.name,
        verified: institute?.verified,
        category: institute?.category
      },
      stats: {
        coursesCount: courses.length,
        enquiriesCount: enquiries.length,
        reviewsCount: reviews.length,
        pendingEnquiries: pendingEnquiries,
        avgRating: parseFloat(avgRating),
        totalRevenue: courses.reduce((sum, course) => sum + (course.price * (course.enrollments || 0)), 0)
      },
      analytics: {
        ratingDistribution,
        enquiryStats,
        monthlyEnquiries: await getMonthlyEnquiries(instituteId),
        coursePerformance: await getCoursePerformance(instituteId)
      },
      recentActivity: {
        enquiries: recentEnquiries,
        reviews: recentReviews
      },
      quickActions: [
        { label: 'Add New Course', action: 'create_course', icon: '📚' },
        { label: 'View Enquiries', action: 'view_enquiries', icon: '📧' },
        { label: 'Manage Profile', action: 'manage_profile', icon: '🏫' },
        { label: 'View Analytics', action: 'view_analytics', icon: '📊' }
      ]
    };
  } catch (error) {
    throw new Error('Failed to fetch institute dashboard data');
  }
};

// User dashboard - student/parent statistics
const getUserDashboard = async (userId) => {
  try {
    const [
      enrolledCourses,
      submittedEnquiries,
      writtenReviews,
      savedInstitutes
    ] = await Promise.all([
      // These would come from your enrollment model
      [], // Placeholder - replace with actual enrollment query
      Enquiry.find({ user: userId }).populate('institute', 'name'),
      Review.find({ user: userId }).populate('institute', 'name'),
      // These would come from your saved institutes model
      [] // Placeholder - replace with actual saved institutes query
    ]);

    const recommendedInstitutes = await Institute.find({ featured: true })
      .limit(4)
      .select('name category rating reviewsCount images');

    return {
      role: 'user',
      stats: {
        enrolledCourses: enrolledCourses.length,
        pendingEnquiries: submittedEnquiries.filter(e => e.status === 'pending').length,
        writtenReviews: writtenReviews.length,
        savedInstitutes: savedInstitutes.length
      },
      recentActivity: {
        enquiries: submittedEnquiries.slice(0, 3),
        reviews: writtenReviews.slice(0, 3)
      },
      recommendations: {
        featuredInstitutes: recommendedInstitutes,
        popularCourses: await getPopularCourses()
      },
      quickActions: [
        { label: 'Browse Institutes', action: 'browse_institutes', icon: '🏫' },
        { label: 'My Enquiries', action: 'view_enquiries', icon: '📧' },
        { label: 'Write Review', action: 'write_review', icon: '⭐' },
        { label: 'Update Profile', action: 'update_profile', icon: '👤' }
      ]
    };
  } catch (error) {
    throw new Error('Failed to fetch user dashboard data');
  }
};

// Helper functions
const calculateRatingDistribution = (reviews) => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(review => {
    const rating = Math.floor(review.rating);
    distribution[rating] = (distribution[rating] || 0) + 1;
  });
  return distribution;
};

const calculateEnquiryStats = (enquiries) => {
  const stats = {
    pending: 0,
    replied: 0,
    resolved: 0,
    total: enquiries.length
  };
  
  enquiries.forEach(enquiry => {
    if (enquiry.status === 'pending') stats.pending++;
    else if (enquiry.status === 'replied') stats.replied++;
    else if (enquiry.status === 'resolved') stats.resolved++;
  });
  
  return stats;
};

const getInstituteCategories = async () => {
  const categories = await Institute.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);
  return categories.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});
};

const getMonthlyGrowth = async () => {
  // Last 6 months growth data
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push({
      month: date.toLocaleString('default', { month: 'short' }),
      institutes: Math.floor(Math.random() * 20) + 5, // Mock data
      users: Math.floor(Math.random() * 50) + 10 // Mock data
    });
  }
  return months;
};

const getMonthlyEnquiries = async (instituteId) => {
  // Last 6 months enquiry data for institute
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push({
      month: date.toLocaleString('default', { month: 'short' }),
      enquiries: Math.floor(Math.random() * 15) + 2 // Mock data
    });
  }
  return months;
};

const getCoursePerformance = async (instituteId) => {
  const courses = await Course.find({ institute: instituteId })
    .select('title price enrollments')
    .limit(5);
  
  return courses.map(course => ({
    name: course.title,
    enrollments: course.enrollments || 0,
    revenue: (course.price || 0) * (course.enrollments || 0)
  }));
};

const getPopularCourses = async () => {
  return await Course.find()
    .populate('institute', 'name')
    .sort({ enrollments: -1 })
    .limit(4)
    .select('title duration price institute enrollments');
};

// Additional dashboard endpoints
const getInstituteStats = async (req, res) => {
  try {
    const instituteId = req.params.instituteId || req.user.institute;
    
    const [courses, enquiries, reviews] = await Promise.all([
      Course.countDocuments({ institute: instituteId }),
      Enquiry.countDocuments({ institute: instituteId }),
      Review.countDocuments({ institute: instituteId })
    ]);

    const reviewData = await Review.find({ institute: instituteId });
    const avgRating = reviewData.length > 0 
      ? (reviewData.reduce((sum, review) => sum + review.rating, 0) / reviewData.length).toFixed(1)
      : 0;

    res.json({
      success: true,
      stats: {
        courses,
        enquiries,
        reviews,
        avgRating: parseFloat(avgRating)
      }
    });
  } catch (error) {
    console.error('Institute stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching institute statistics'
    });
  }
};

const getPlatformStats = async (req, res) => {
  try {
    const [institutes, users, courses, enquiries, reviews] = await Promise.all([
      Institute.countDocuments(),
      User.countDocuments(),
      Course.countDocuments(),
      Enquiry.countDocuments(),
      Review.countDocuments()
    ]);

    const reviewData = await Review.find();
    const avgRating = reviewData.length > 0 
      ? (reviewData.reduce((sum, review) => sum + review.rating, 0) / reviewData.length).toFixed(1)
      : 0;

    res.json({
      success: true,
      stats: {
        institutes,
        users,
        courses,
        enquiries,
        reviews,
        avgRating: parseFloat(avgRating)
      }
    });
  } catch (error) {
    console.error('Platform stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching platform statistics'
    });
  }
};

module.exports = { 
  getDashboardData, 
  getInstituteStats, 
  getPlatformStats 
};