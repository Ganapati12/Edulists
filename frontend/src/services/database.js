// src/services/database.js
class EduListDatabase {
  constructor() {
    this.STORAGE_KEY = 'EDULIST_DYNAMIC_DB_V2';
    this.initDatabase();
  }

  initDatabase() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      const initialData = {
        users: this.generateUsers(20),
        institutes: this.generateInstitutes(30),
        admin: {
          id: 'admin_1',
          email: 'admin@edulist.com',
          password: 'admin123',
          name: 'System Administrator',
          role: 'admin'
        },
        courses: this.generateCourses(50),
        reviews: [],
        enquiries: [],
        currentUser: null,
        stats: {
          totalUsers: 20,
          totalInstitutes: 30,
          totalCourses: 50,
          totalEnquiries: 0,
          totalReviews: 0
        }
      };
      this.saveData(initialData);
    }
  }

  generateUsers(count) {
    const users = [];
    const names = [
      'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Emma Brown',
      'Frank Miller', 'Grace Lee', 'Henry Taylor', 'Ivy Chen', 'Jack Martin',
      'Katie Anderson', 'Leo Garcia', 'Mia Rodriguez', 'Nathan Lopez', 'Olivia Perez',
      'Paul Scott', 'Quinn Hall', 'Rachel Young', 'Sam King', 'Tina Wright'
    ];

    for (let i = 0; i < count; i++) {
      users.push({
        id: `user_${i + 1}`,
        name: names[i],
        email: `user${i + 1}@example.com`,
        password: 'password123',
        phone: `+1-555-${String(i + 1000).padStart(4, '0')}`,
        role: 'user',
        status: i < 15 ? 'approved' : 'pending',
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        profile: {
          bio: `Education enthusiast passionate about learning new skills.`,
          interests: ['Technology', 'Business', 'Arts', 'Science'][Math.floor(Math.random() * 4)],
          educationLevel: ['High School', 'Bachelor', 'Master', 'PhD'][Math.floor(Math.random() * 4)]
        },
        enrolledCourses: [],
        savedInstitutes: []
      });
    }
    return users;
  }

  generateInstitutes(count) {
    const institutes = [];
    const names = [
      'Harvard University', 'Stanford College', 'MIT Institute', 'Cambridge Academy',
      'Oxford University', 'Yale College', 'Princeton Institute', 'Columbia Academy',
      'Chicago University', 'Imperial College', 'ETH Zurich', 'California Institute',
      'Tokyo University', 'National University', 'Seoul National', 'Peking University',
      'Tsinghua College', 'NUS Singapore', 'Melbourne University', 'Sydney Institute',
      'Toronto Academy', 'McGill University', 'UBC Institute', 'Waterloo College',
      'Delhi University', 'IIT Bombay', 'IISc Bangalore', 'BITS Pilani', 'Anna University',
      'Amrita Institute'
    ];

    const categories = ['university', 'college', 'engineering', 'medical', 'arts', 'business'];
    const cities = ['New York', 'London', 'Boston', 'San Francisco', 'Chicago', 'Los Angeles', 
                   'Singapore', 'Tokyo', 'Sydney', 'Toronto', 'Delhi', 'Bangalore'];

    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = i < 20 ? 'approved' : 'pending';
      
      institutes.push({
        id: `inst_${i + 1}`,
        name: names[i],
        email: `contact@${names[i].toLowerCase().replace(/\s+/g, '')}.edu`,
        password: 'institute123',
        category: category,
        description: `A premier ${category} institution offering world-class education with experienced faculty and state-of-the-art facilities.`,
        contact: {
          phone: `+1-555-${String(i + 2000).padStart(4, '0')}`,
          email: `info@${names[i].toLowerCase().replace(/\s+/g, '')}.edu`
        },
        address: {
          street: `${Math.floor(Math.random() * 1000) + 1} Education Street`,
          city: cities[Math.floor(Math.random() * cities.length)],
          state: 'State',
          country: 'Country',
          zipCode: String(10000 + i).padStart(5, '0')
        },
        facilities: this.generateFacilities(),
        stats: {
          rating: (Math.random() * 1 + 4).toFixed(1), // 4.0 - 5.0
          reviews: Math.floor(Math.random() * 1000),
          students: Math.floor(Math.random() * 10000) + 1000,
          courses: Math.floor(Math.random() * 50) + 10
        },
        images: [
          `https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80&${i}`,
          `https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80&${i}`
        ],
        status: status,
        role: 'institute',
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        approvedAt: status === 'approved' ? new Date().toISOString() : null,
        courses: []
      });
    }
    return institutes;
  }

  generateFacilities() {
    const allFacilities = [
      'Library', 'Computer Lab', 'Sports Complex', 'Hostel', 'Cafeteria',
      'Auditorium', 'Medical Center', 'Wi-Fi Campus', 'Research Center',
      'Transportation', 'Gym', 'Swimming Pool', 'Arts Center', 'Science Lab'
    ];
    return allFacilities.slice(0, Math.floor(Math.random() * 6) + 4);
  }

  generateCourses(count) {
    const courses = [];
    const courseTitles = [
      'Computer Science Fundamentals', 'Business Administration', 'Mechanical Engineering',
      'Electrical Engineering', 'Civil Engineering', 'Medical Sciences', 'Law Studies',
      'Arts and Humanities', 'Social Sciences', 'Natural Sciences', 'Mathematics',
      'Physics Advanced', 'Chemistry Fundamentals', 'Biology Research', 'Economics Theory',
      'Psychology Studies', 'History Research', 'Literature Analysis', 'Philosophy',
      'Architecture Design', 'Fine Arts', 'Music Theory', 'Dance Performance',
      'Theater Arts', 'Film Studies', 'Journalism', 'Communication Skills',
      'Environmental Science', 'Agriculture Studies', 'Veterinary Science'
    ];

    for (let i = 0; i < count; i++) {
      courses.push({
        id: `course_${i + 1}`,
        title: courseTitles[i % courseTitles.length],
        description: `Comprehensive course covering all aspects of ${courseTitles[i % courseTitles.length].toLowerCase()}.`,
        instituteId: `inst_${Math.floor(Math.random() * 30) + 1}`,
        duration: `${Math.floor(Math.random() * 4) + 1} years`,
        fees: Math.floor(Math.random() * 50000) + 10000,
        seats: Math.floor(Math.random() * 100) + 20,
        category: ['Engineering', 'Medical', 'Arts', 'Science', 'Business'][Math.floor(Math.random() * 5)],
        level: ['Undergraduate', 'Postgraduate', 'Diploma', 'Certificate'][Math.floor(Math.random() * 4)],
        rating: (Math.random() * 1 + 4).toFixed(1),
        enrolledStudents: Math.floor(Math.random() * 500),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    return courses;
  }

  // Database operations
  getData() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
  }

  saveData(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  // User operations
  findUserByEmail(email) {
    const data = this.getData();
    return data.users.find(user => user.email === email) || 
           data.institutes.find(inst => inst.email === email) ||
           (data.admin.email === email ? data.admin : null);
  }

  createUser(userData) {
    const data = this.getData();
    const newUser = {
      id: `user_${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    data.users.push(newUser);
    data.stats.totalUsers++;
    this.saveData(data);
    return newUser;
  }

  createInstitute(instituteData) {
    const data = this.getData();
    const newInstitute = {
      id: `inst_${Date.now()}`,
      ...instituteData,
      createdAt: new Date().toISOString(),
      status: 'pending',
      stats: {
        rating: 0,
        reviews: 0,
        students: 0,
        courses: 0
      },
      facilities: []
    };
    data.institutes.push(newInstitute);
    data.stats.totalInstitutes++;
    this.saveData(data);
    return newInstitute;
  }

  // Authentication
  authenticate(email, password) {
    const user = this.findUserByEmail(email);
    if (user && user.password === password) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  // Update operations
  updateUserStatus(userId, status) {
    const data = this.getData();
    const user = data.users.find(u => u.id === userId);
    if (user) {
      user.status = status;
      user.approvedAt = status === 'approved' ? new Date().toISOString() : null;
      this.saveData(data);
      return user;
    }
    return null;
  }

  updateInstituteStatus(instituteId, status) {
    const data = this.getData();
    const institute = data.institutes.find(inst => inst.id === instituteId);
    if (institute) {
      institute.status = status;
      institute.approvedAt = status === 'approved' ? new Date().toISOString() : null;
      this.saveData(data);
      return institute;
    }
    return null;
  }

  // Get operations
  getPendingUsers() {
    const data = this.getData();
    return data.users.filter(user => user.status === 'pending');
  }

  getPendingInstitutes() {
    const data = this.getData();
    return data.institutes.filter(inst => inst.status === 'pending');
  }

  getApprovedInstitutes() {
    const data = this.getData();
    return data.institutes.filter(inst => inst.status === 'approved');
  }

  getInstituteById(id) {
    const data = this.getData();
    return data.institutes.find(inst => inst.id === id);
  }

  getUserById(id) {
    const data = this.getData();
    return data.users.find(user => user.id === id);
  }

  // Search operations
  searchInstitutes(query, filters = {}) {
    const data = this.getData();
    let results = data.institutes.filter(inst => inst.status === 'approved');

    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(inst =>
        inst.name.toLowerCase().includes(searchTerm) ||
        inst.description.toLowerCase().includes(searchTerm) ||
        inst.category.toLowerCase().includes(searchTerm) ||
        inst.address.city.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.category) {
      results = results.filter(inst => inst.category === filters.category);
    }

    if (filters.city) {
      results = results.filter(inst => 
        inst.address.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.minRating) {
      results = results.filter(inst => inst.stats.rating >= filters.minRating);
    }

    return results;
  }

  // Course operations
  getCoursesByInstitute(instituteId) {
    const data = this.getData();
    return data.courses.filter(course => course.instituteId === instituteId);
  }

  // Review operations
  addReview(reviewData) {
    const data = this.getData();
    const newReview = {
      id: `review_${Date.now()}`,
      ...reviewData,
      createdAt: new Date().toISOString(),
      status: 'approved'
    };
    data.reviews.push(newReview);
    data.stats.totalReviews++;
    this.saveData(data);
    return newReview;
  }

  getReviewsByInstitute(instituteId) {
    const data = this.getData();
    return data.reviews.filter(review => review.instituteId === instituteId);
  }

  // Enquiry operations
  addEnquiry(enquiryData) {
    const data = this.getData();
    const newEnquiry = {
      id: `enquiry_${Date.now()}`,
      ...enquiryData,
      createdAt: new Date().toISOString(),
      status: 'new'
    };
    data.enquiries.push(newEnquiry);
    data.stats.totalEnquiries++;
    this.saveData(data);
    return newEnquiry;
  }

  getEnquiriesByInstitute(instituteId) {
    const data = this.getData();
    return data.enquiries.filter(enquiry => enquiry.instituteId === instituteId);
  }

  // Statistics
  getDashboardStats() {
    const data = this.getData();
    return {
      totalUsers: data.users.length,
      totalInstitutes: data.institutes.length,
      totalCourses: data.courses.length,
      pendingApprovals: data.institutes.filter(inst => inst.status === 'pending').length,
      totalEnquiries: data.enquiries.length,
      totalReviews: data.reviews.length,
      approvedInstitutes: data.institutes.filter(inst => inst.status === 'approved').length
    };
  }
}

export const database = new EduListDatabase();