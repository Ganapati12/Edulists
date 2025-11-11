import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'build')));

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulists');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('❌ MongoDB Connection Error:', error.message);
  }
};

connectDB();

// ✅ Add request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ API Routes

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ✅ AUTH ROUTES
app.post('/api/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  
  const { email, password, userType } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Admin authentication
  if (userType === 'admin' && email === 'admin@edulist.com' && password === 'admin123') {
    const token = jwt.sign(
      { 
        id: 1, 
        email: email,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    const user = {
      id: 1,
      name: 'Admin User',
      email: email,
      role: 'admin'
    };

    return res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: user
    });
  }

  // Regular user authentication
  const token = jwt.sign(
    { 
      id: Date.now(), 
      email: email,
      role: 'user'
    },
    process.env.JWT_SECRET || 'fallback-secret-key',
    { expiresIn: '24h' }
  );

  const user = {
    id: Date.now(),
    name: 'Test User',
    email: email,
    role: 'user'
  };

  res.json({
    success: true,
    message: 'Login successful',
    token: token,
    user: user
  });
});

app.post('/api/auth/register', (req, res) => {
  console.log('Register attempt:', req.body);
  
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email and password are required'
    });
  }

  // Generate a JWT token for the new user
  const token = jwt.sign(
    { 
      id: Date.now(), 
      email: email,
      role: 'user'
    },
    process.env.JWT_SECRET || 'fallback-secret-key',
    { expiresIn: '24h' }
  );

  const user = {
    id: Date.now(),
    name: name,
    email: email,
    role: 'user'
  };

  res.json({
    success: true,
    message: 'Registration successful',
    token: token,
    user: user
  });
});

// ✅ DASHBOARD ROUTES
app.get('/api/dashboard', (req, res) => {
  console.log('📊 Dashboard route accessed');
  
  // Mock dashboard data
  const dashboardData = {
    name: 'Admin Dashboard',
    enquiriesCount: 15,
    reviewsCount: 23,
    avgRating: 4.2,
    stats: {
      totalCourses: 12,
      pendingEnquiries: 5,
      flaggedReviews: 3,
      activeUsers: 47
    },
    recentActivity: [
      { id: 1, action: 'New course added', time: '2 hours ago' },
      { id: 2, action: 'Enquiry received', time: '5 hours ago' }
    ],
    timestamp: new Date().toISOString()
  };

  res.json(dashboardData);
});

// ✅ ADD THE MISSING DASHBOARD STATS ENDPOINT
app.get('/api/dashboard/stats', (req, res) => {
  console.log('📈 Dashboard stats route accessed');

  // Mock dashboard stats data (this is what your React app is looking for)
  const statsData = {
    totalStudents: 1247,
    totalCourses: 48,
    activeUsers: 893,
    revenue: 125430,
    pendingApplications: 23,
    completionRate: 87,
    growth: 12.5,
    timestamp: new Date().toISOString()
  };

  console.log('📊 Sending dashboard stats:', statsData);
  res.json(statsData);
});

// ✅ INSTITUTES ROUTES
app.get('/api/institutes', (req, res) => {
  console.log('🏫 Institutes route accessed with query:', req.query);
  
  // Mock institutes data
  const institutes = [
    {
      _id: '1',
      name: 'Delhi Public School',
      category: 'school',
      description: 'One of the top schools in Delhi with excellent academic record and facilities.',
      address: {
        street: 'Mathura Road',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110003'
      },
      contact: {
        email: 'info@dps.com',
        phone: '+91-11-23235135',
        website: 'https://dps.com'
      },
      facilities: ['Library', 'Sports', 'Science Lab', 'Computer Lab', 'Auditorium'],
      courses: [
        { name: 'CBSE Curriculum', duration: '12 Years', fees: 15000, description: 'Complete CBSE education from 1st to 12th' },
        { name: 'Science Stream', duration: '2 Years', fees: 18000, description: '11th and 12th Science with PCM/PCB' }
      ],
      images: ['/api/placeholder/400/250'],
      rating: 4.5,
      reviewsCount: 124,
      featured: true,
      verified: true,
      establishedYear: 1949,
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-01-15T10:00:00.000Z'
    },
    {
      _id: '2',
      name: 'St. Xavier\'s College',
      category: 'college',
      description: 'Premier institution for higher education with excellent placement records.',
      address: {
        street: 'Mahapalika Marg',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      contact: {
        email: 'admissions@xaviers.edu',
        phone: '+91-22-22620661',
        website: 'https://xaviers.edu'
      },
      facilities: ['Library', 'Hostel', 'Sports Complex', 'Research Center', 'Cafeteria'],
      courses: [
        { name: 'B.Sc Computer Science', duration: '3 Years', fees: 25000, description: 'Undergraduate program in Computer Science' },
        { name: 'B.A. Economics', duration: '3 Years', fees: 22000, description: 'Bachelor of Arts in Economics' }
      ],
      images: ['/api/placeholder/400/250'],
      rating: 4.8,
      reviewsCount: 89,
      featured: true,
      verified: true,
      establishedYear: 1869,
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-01-15T10:00:00.000Z'
    }
  ];

  // Handle filtering
  let filteredInstitutes = [...institutes];
  
  // Filter by featured
  if (req.query.featured === 'true') {
    filteredInstitutes = filteredInstitutes.filter(inst => inst.featured);
  }
  
  // Filter by category
  if (req.query.category) {
    filteredInstitutes = filteredInstitutes.filter(inst => 
      inst.category === req.query.category
    );
  }
  
  // Filter by city
  if (req.query.city) {
    filteredInstitutes = filteredInstitutes.filter(inst => 
      inst.address.city.toLowerCase().includes(req.query.city.toLowerCase())
    );
  }
  
  // Search by name or description
  if (req.query.search) {
    const searchTerm = req.query.search.toLowerCase();
    filteredInstitutes = filteredInstitutes.filter(inst => 
      inst.name.toLowerCase().includes(searchTerm) ||
      inst.description.toLowerCase().includes(searchTerm)
    );
  }
  
  // Limit results
  if (req.query.limit) {
    const limit = parseInt(req.query.limit);
    filteredInstitutes = filteredInstitutes.slice(0, limit);
  }

  res.json({
    success: true,
    institutes: filteredInstitutes,
    total: filteredInstitutes.length,
    message: 'Institutes fetched successfully'
  });
});

app.get('/api/institutes/:id', (req, res) => {
  console.log('🏫 Single institute route accessed:', req.params.id);
  
  const institutes = [
    {
      _id: '1',
      name: 'Delhi Public School',
      category: 'school',
      description: 'One of the top schools in Delhi with excellent academic record and facilities. Established in 1949, DPS has been providing quality education for decades.',
      address: {
        street: 'Mathura Road',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110003'
      },
      contact: {
        email: 'info@dps.com',
        phone: '+91-11-23235135',
        website: 'https://dps.com'
      },
      facilities: ['Library', 'Sports Ground', 'Science Lab', 'Computer Lab', 'Auditorium', 'Swimming Pool', 'Art Room', 'Music Room'],
      courses: [
        { _id: '1', name: 'CBSE Curriculum', duration: '12 Years', fees: 15000, description: 'Complete CBSE education from 1st to 12th standard' },
        { _id: '2', name: 'Science Stream', duration: '2 Years', fees: 18000, description: '11th and 12th Science with PCM/PCB options' },
        { _id: '3', name: 'Commerce Stream', duration: '2 Years', fees: 16000, description: '11th and 12th Commerce with Accountancy and Business' }
      ],
      images: ['/api/placeholder/800/400', '/api/placeholder/800/400', '/api/placeholder/800/400'],
      rating: 4.5,
      reviewsCount: 124,
      featured: true,
      verified: true,
      establishedYear: 1949,
      views: 1567,
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-01-15T10:00:00.000Z'
    }
  ];

  const institute = institutes.find(inst => inst._id === req.params.id);
  
  if (!institute) {
    return res.status(404).json({
      success: false,
      message: 'Institute not found'
    });
  }

  res.json({
    success: true,
    institute: institute,
    message: 'Institute details fetched successfully'
  });
});

// ✅ ENHANCED REVIEWS ROUTE WITH INSTITUTE FILTERING
app.get('/api/reviews', (req, res) => {
  console.log('⭐ Reviews route accessed with query:', req.query);
  
  const allReviews = [
    {
      _id: '1',
      user: { _id: '1', name: 'Rahul Sharma' },
      institute: { _id: '1', name: 'Delhi Public School' },
      rating: 5,
      comment: 'Excellent school with great teachers and infrastructure. My child has improved tremendously.',
      approved: true,
      flagged: false,
      createdAt: '2024-01-15T10:00:00.000Z'
    },
    {
      _id: '2',
      user: { _id: '2', name: 'Priya Patel' },
      institute: { _id: '1', name: 'Delhi Public School' },
      rating: 4,
      comment: 'Good school but fees are a bit high. Quality education though.',
      approved: true,
      flagged: false,
      createdAt: '2024-01-14T15:30:00.000Z'
    }
  ];

  let filteredReviews = [...allReviews];
  
  // Filter by institute
  if (req.query.institute) {
    filteredReviews = filteredReviews.filter(review => 
      review.institute._id === req.query.institute
    );
  }

  res.json({
    success: true,
    reviews: filteredReviews,
    total: filteredReviews.length,
    message: 'Reviews fetched successfully'
  });
});

// ✅ ENHANCED COURSES ROUTE
app.get('/api/courses', (req, res) => {
  console.log('📚 Courses route accessed');
  
  const courses = [
    {
      _id: '1',
      title: 'Mathematics 101',
      description: 'Basic mathematics course covering algebra and geometry',
      duration: '6 months',
      price: 5000,
      institute: 'Delhi Public School',
      status: 'active',
      createdAt: '2024-01-15T10:00:00.000Z'
    },
    {
      _id: '2',
      title: 'Science Basics',
      description: 'Fundamental concepts of physics, chemistry and biology',
      duration: '8 months',
      price: 6000,
      institute: 'St. Xavier\'s College',
      status: 'active',
      createdAt: '2024-01-14T15:30:00.000Z'
    }
  ];

  res.json({
    success: true,
    courses: courses,
    total: courses.length,
    message: 'Courses fetched successfully'
  });
});

app.post('/api/courses', (req, res) => {
  console.log('📚 Create course:', req.body);
  
  const newCourse = {
    _id: Date.now().toString(),
    ...req.body,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    course: newCourse
  });
});

app.put('/api/courses/:id', (req, res) => {
  console.log('📚 Update course:', req.params.id, req.body);
  
  res.json({
    success: true,
    message: 'Course updated successfully',
    course: {
      _id: req.params.id,
      ...req.body,
      updatedAt: new Date().toISOString()
    }
  });
});

app.delete('/api/courses/:id', (req, res) => {
  console.log('📚 Delete course:', req.params.id);
  
  res.json({
    success: true,
    message: 'Course deleted successfully'
  });
});

// ✅ ENHANCED ENQUIRIES ROUTE
app.get('/api/enquiries', (req, res) => {
  console.log('📧 Enquiries route accessed');
  
  const enquiries = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+91-9876543210',
      course: 'Mathematics 101',
      institute: 'Delhi Public School',
      message: 'I would like to know more about the admission process.',
      status: 'pending',
      createdAt: '2024-01-15T10:00:00.000Z'
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+91-9876543211',
      course: 'Science Basics',
      institute: 'St. Xavier\'s College',
      message: 'Please send me the course syllabus and fee structure.',
      status: 'replied',
      createdAt: '2024-01-14T15:30:00.000Z'
    }
  ];

  res.json({
    success: true,
    enquiries: enquiries,
    total: enquiries.length,
    message: 'Enquiries fetched successfully'
  });
});

app.put('/api/enquiries/:id/reply', (req, res) => {
  console.log('📧 Reply to enquiry:', req.params.id, req.body);
  
  res.json({
    success: true,
    message: 'Reply sent successfully',
    enquiry: {
      _id: req.params.id,
      status: 'replied',
      repliedAt: new Date().toISOString()
    }
  });
});

// ✅ ADDITIONAL ROUTES FOR ADMIN DASHBOARD
app.get('/api/users', (req, res) => {
  res.json([
    { _id: 1, name: 'John Doe', email: 'john@example.com', role: 'student' },
    { _id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'student' }
  ]);
});

app.get('/api/payments/all', (req, res) => {
  res.json([
    { _id: 1, userId: 1, courseId: 1, amount: 5000, status: 'Pending' },
    { _id: 2, userId: 2, courseId: 2, amount: 3000, status: 'Approved' }
  ]);
});

app.get('/api/quizmarks', (req, res) => {
  res.json([
    { _id: 1, userId: 1, courseId: 1, marks: 85 },
    { _id: 2, userId: 2, courseId: 2, marks: 92 }
  ]);
});

app.get('/api/certificates', (req, res) => {
  res.json([
    { _id: 1, userId: 1, courseId: 1, issuedDate: '2024-01-15' },
    { _id: 2, userId: 2, courseId: 2, issuedDate: '2024-01-10' }
  ]);
});

// ✅ WebSocket endpoint for real-time features
app.get('/api/ws', (req, res) => {
  res.json({
    message: 'WebSocket endpoint',
    status: 'available'
  });
});

// ✅ FIXED CATCH-ALL HANDLER - Use a different approach
// Option 1: Use a specific route for the root
app.get('/', (req, res) => {
  console.log('🎯 Serving React app for root route');
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Option 2: Use a parameter-based catch-all (more compatible)
app.get('/:path', (req, res) => {
  console.log(`🎯 Serving React app for path: ${req.params.path}`);
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Option 3: Handle nested paths
app.get('/:path1/:path2', (req, res) => {
  console.log(`🎯 Serving React app for nested path: ${req.params.path1}/${req.params.path2}`);
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/:path1/:path2/:path3', (req, res) => {
  console.log(`🎯 Serving React app for deep nested path: ${req.params.path1}/${req.params.path2}/${req.params.path3}`);
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// ✅ Final fallback - 404 handler for API routes
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({
      error: 'API endpoint not found',
      message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`,
      timestamp: new Date().toISOString()
    });
  }
  
  // For non-API routes, serve the React app
  console.log(`🎯 Fallback: Serving React app for: ${req.originalUrl}`);
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Frontend: http://localhost:${PORT}`);
  console.log(`📍 API Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 Dashboard Stats: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`\n📊 The missing /api/dashboard/stats endpoint has been added!`);
  console.log(`🎯 React app will be served for all non-API routes`);
});