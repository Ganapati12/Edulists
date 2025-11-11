// src/services/localAuth.js
const STORAGE_KEY = 'EDULIST_DB_V1';

// Initial DB structure
const defaultDB = {
  admin: { 
    email: 'admin@edulist.com', 
    password: 'admin123',
    name: 'System Administrator'
  },
  institutes: [], // { id, name, email, password, approved, createdAt, courses: [] }
  users: [], // { id, name, email, password, approved, createdAt, enrolledCourses: [] }
  courses: [], // { id, title, description, instituteId, createdAt, price, duration, category }
  enrollments: [], // { id, userId, courseId, enrolledAt, status }
  currentUser: null, // { role, id, email, name, token, approved }
  settings: {
    theme: 'light',
    language: 'en'
  }
};

class LocalDBAuth {
  constructor() {
    this.key = STORAGE_KEY;
    this.initializeDB();
  }

  initializeDB() {
    const existing = localStorage.getItem(this.key);
    if (!existing) {
      localStorage.setItem(this.key, JSON.stringify(defaultDB));
    }
  }

  readDB() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : { ...defaultDB };
    } catch (error) {
      console.error('Error reading database:', error);
      return { ...defaultDB };
    }
  }

  writeDB(db) {
    try {
      localStorage.setItem(this.key, JSON.stringify(db));
      return true;
    } catch (error) {
      console.error('Error writing database:', error);
      return false;
    }
  }

  generateId(prefix = '') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }

  // Authentication Methods
  registerInstitute({ name, email, password, description = '', contact = '' }) {
    const db = this.readDB();
    
    if (!name || !email || !password) {
      return { ok: false, message: 'All fields are required' };
    }

    if (db.institutes.find(inst => inst.email === email)) {
      return { ok: false, message: 'Email already registered' };
    }

    const institute = {
      id: this.generateId('inst_'),
      name,
      email,
      password,
      description,
      contact,
      approved: false,
      createdAt: new Date().toISOString(),
      courses: [],
      stats: {
        totalCourses: 0,
        totalStudents: 0
      }
    };

    db.institutes.push(institute);
    const success = this.writeDB(db);

    return success ? 
      { ok: true, institute: { ...institute, password: undefined } } : 
      { ok: false, message: 'Failed to register institute' };
  }

  registerUser({ name, email, password, phone = '', address = '' }) {
    const db = this.readDB();
    
    if (!name || !email || !password) {
      return { ok: false, message: 'All fields are required' };
    }

    if (db.users.find(user => user.email === email)) {
      return { ok: false, message: 'Email already registered' };
    }

    const user = {
      id: this.generateId('user_'),
      name,
      email,
      password,
      phone,
      address,
      approved: true, // Auto-approve users by default
      createdAt: new Date().toISOString(),
      enrolledCourses: [],
      preferences: {
        notifications: true,
        emailUpdates: true
      }
    };

    db.users.push(user);
    const success = this.writeDB(db);

    return success ? 
      { ok: true, user: { ...user, password: undefined } } : 
      { ok: false, message: 'Failed to register user' };
  }

  login(role, email, password) {
    const db = this.readDB();

    try {
      if (role === 'admin') {
        if (email === db.admin.email && password === db.admin.password) {
          const token = 'admin_' + this.generateId();
          const currentUser = {
            role: 'admin',
            id: 'admin',
            email: db.admin.email,
            name: db.admin.name,
            token,
            approved: true
          };
          db.currentUser = currentUser;
          this.writeDB(db);
          return { ok: true, user: currentUser };
        }
        return { ok: false, message: 'Invalid admin credentials' };
      }

      if (role === 'institute') {
        const institute = db.institutes.find(inst => 
          inst.email === email && inst.password === password
        );
        
        if (!institute) {
          return { ok: false, message: 'Invalid institute credentials' };
        }

        if (!institute.approved) {
          return { ok: false, message: 'Institute account pending approval' };
        }

        const token = 'inst_' + this.generateId();
        const currentUser = {
          role: 'institute',
          id: institute.id,
          email: institute.email,
          name: institute.name,
          token,
          approved: institute.approved,
          instituteData: {
            description: institute.description,
            contact: institute.contact,
            stats: institute.stats
          }
        };
        db.currentUser = currentUser;
        this.writeDB(db);
        return { ok: true, user: currentUser };
      }

      if (role === 'user') {
        const user = db.users.find(u => 
          u.email === email && u.password === password
        );
        
        if (!user) {
          return { ok: false, message: 'Invalid user credentials' };
        }

        if (!user.approved) {
          return { ok: false, message: 'User account pending approval' };
        }

        const token = 'user_' + this.generateId();
        const currentUser = {
          role: 'user',
          id: user.id,
          email: user.email,
          name: user.name,
          token,
          approved: user.approved,
          userData: {
            phone: user.phone,
            address: user.address,
            preferences: user.preferences
          }
        };
        db.currentUser = currentUser;
        this.writeDB(db);
        return { ok: true, user: currentUser };
      }

      return { ok: false, message: 'Unknown role specified' };
    } catch (error) {
      console.error('Login error:', error);
      return { ok: false, message: 'Login failed due to system error' };
    }
  }

  logout() {
    const db = this.readDB();
    db.currentUser = null;
    this.writeDB(db);
    return { ok: true, message: 'Logged out successfully' };
  }

  getCurrentUser() {
    const db = this.readDB();
    return db.currentUser;
  }

  isAuthenticated() {
    const currentUser = this.getCurrentUser();
    return !!currentUser;
  }

  // Admin Management Methods
  getAllInstitutes() {
    const db = this.readDB();
    return db.institutes.map(inst => ({ ...inst, password: undefined }));
  }

  getAllUsers() {
    const db = this.readDB();
    return db.users.map(user => ({ ...user, password: undefined }));
  }

  setApproval(type, id, approved) {
    const db = this.readDB();
    let entity = null;

    if (type === 'institute') {
      entity = db.institutes.find(inst => inst.id === id);
    } else if (type === 'user') {
      entity = db.users.find(user => user.id === id);
    }

    if (entity) {
      entity.approved = !!approved;
      
      // Update current user if they are the one being approved
      if (db.currentUser && db.currentUser.id === id) {
        db.currentUser.approved = !!approved;
      }

      const success = this.writeDB(db);
      return success ? 
        { ok: true, message: `${type} approval status updated` } : 
        { ok: false, message: 'Failed to update approval status' };
    }

    return { ok: false, message: `${type} not found` };
  }

  // Course Management Methods
  createCourse(instituteId, courseData) {
    const db = this.readDB();
    const institute = db.institutes.find(inst => inst.id === instituteId);
    
    if (!institute) {
      return { ok: false, message: 'Institute not found' };
    }

    const course = {
      id: this.generateId('course_'),
      instituteId,
      instituteName: institute.name,
      ...courseData,
      createdAt: new Date().toISOString(),
      enrolledStudents: 0,
      rating: 0,
      reviews: []
    };

    db.courses.push(course);
    
    // Add to institute's courses
    institute.courses.push(course.id);
    institute.stats.totalCourses = institute.courses.length;

    const success = this.writeDB(db);
    return success ? 
      { ok: true, course } : 
      { ok: false, message: 'Failed to create course' };
  }

  getAllCourses() {
    const db = this.readDB();
    return db.courses;
  }

  getInstituteCourses(instituteId) {
    const db = this.readDB();
    return db.courses.filter(course => course.instituteId === instituteId);
  }

  getCourseById(courseId) {
    const db = this.readDB();
    return db.courses.find(course => course.id === courseId);
  }

  // Enrollment Methods
  enrollInCourse(userId, courseId) {
    const db = this.readDB();
    
    const user = db.users.find(u => u.id === userId);
    const course = db.courses.find(c => c.id === courseId);
    
    if (!user || !course) {
      return { ok: false, message: 'User or course not found' };
    }

    // Check if already enrolled
    const existingEnrollment = db.enrollments.find(
      e => e.userId === userId && e.courseId === courseId
    );
    
    if (existingEnrollment) {
      return { ok: false, message: 'Already enrolled in this course' };
    }

    const enrollment = {
      id: this.generateId('enroll_'),
      userId,
      courseId,
      enrolledAt: new Date().toISOString(),
      status: 'active',
      progress: 0,
      completed: false
    };

    db.enrollments.push(enrollment);
    
    // Update user's enrolled courses
    user.enrolledCourses.push(courseId);
    
    // Update course enrollment count
    course.enrolledStudents += 1;
    
    // Update institute stats
    const institute = db.institutes.find(inst => inst.id === course.instituteId);
    if (institute) {
      institute.stats.totalStudents += 1;
    }

    const success = this.writeDB(db);
    return success ? 
      { ok: true, enrollment } : 
      { ok: false, message: 'Failed to enroll in course' };
  }

  getUserEnrollments(userId) {
    const db = this.readDB();
    const userEnrollments = db.enrollments.filter(e => e.userId === userId);
    
    return userEnrollments.map(enrollment => {
      const course = db.courses.find(c => c.id === enrollment.courseId);
      return {
        ...enrollment,
        course: course ? { ...course } : null
      };
    });
  }

  // Search and Filter Methods
  searchCourses(query, filters = {}) {
    const db = this.readDB();
    let results = db.courses;

    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(course =>
        course.title.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm) ||
        course.category.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.category) {
      results = results.filter(course => 
        course.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.instituteId) {
      results = results.filter(course => 
        course.instituteId === filters.instituteId
      );
    }

    if (filters.maxPrice !== undefined) {
      results = results.filter(course => 
        course.price <= filters.maxPrice
      );
    }

    return results;
  }

  // Profile Management
  updateProfile(userId, updates) {
    const db = this.readDB();
    let entity = null;
    let type = '';

    if (db.currentUser?.role === 'user' && db.currentUser.id === userId) {
      entity = db.users.find(user => user.id === userId);
      type = 'user';
    } else if (db.currentUser?.role === 'institute' && db.currentUser.id === userId) {
      entity = db.institutes.find(inst => inst.id === userId);
      type = 'institute';
    }

    if (!entity) {
      return { ok: false, message: 'User not found or unauthorized' };
    }

    // Remove sensitive fields from updates
    const { password, id, approved, ...safeUpdates } = updates;
    
    Object.assign(entity, safeUpdates);
    
    // Update current user data if it's the logged-in user
    if (db.currentUser && db.currentUser.id === userId) {
      Object.assign(db.currentUser, safeUpdates);
    }

    const success = this.writeDB(db);
    return success ? 
      { ok: true, message: 'Profile updated successfully' } : 
      { ok: false, message: 'Failed to update profile' };
  }

  changePassword(userId, currentPassword, newPassword) {
    const db = this.readDB();
    let entity = null;

    if (db.currentUser?.role === 'user') {
      entity = db.users.find(user => user.id === userId);
    } else if (db.currentUser?.role === 'institute') {
      entity = db.institutes.find(inst => inst.id === userId);
    } else if (db.currentUser?.role === 'admin' && userId === 'admin') {
      entity = db.admin;
    }

    if (!entity || entity.password !== currentPassword) {
      return { ok: false, message: 'Current password is incorrect' };
    }

    entity.password = newPassword;
    const success = this.writeDB(db);

    return success ? 
      { ok: true, message: 'Password changed successfully' } : 
      { ok: false, message: 'Failed to change password' };
  }

  // System Methods
  reset() {
    localStorage.removeItem(this.key);
    this.initializeDB();
    return { ok: true, message: 'Database reset successfully' };
  }

  seed() {
    const db = this.readDB();
    
    // Seed institutes if empty
    if (db.institutes.length === 0) {
      db.institutes.push(
        {
          id: this.generateId('inst_'),
          name: 'Alpha Institute of Technology',
          email: 'alpha@inst.com',
          password: 'alpha123',
          description: 'Premier technology education institute',
          contact: '+1234567890',
          approved: true,
          createdAt: new Date().toISOString(),
          courses: [],
          stats: { totalCourses: 0, totalStudents: 0 }
        },
        {
          id: this.generateId('inst_'),
          name: 'Beta Business School',
          email: 'beta@inst.com',
          password: 'beta123',
          description: 'Leading business and management school',
          contact: '+0987654321',
          approved: false,
          createdAt: new Date().toISOString(),
          courses: [],
          stats: { totalCourses: 0, totalStudents: 0 }
        }
      );
    }

    // Seed users if empty
    if (db.users.length === 0) {
      db.users.push(
        {
          id: this.generateId('user_'),
          name: 'Alice Johnson',
          email: 'alice@user.com',
          password: 'alice123',
          phone: '+1111111111',
          address: '123 Main St, City',
          approved: true,
          createdAt: new Date().toISOString(),
          enrolledCourses: [],
          preferences: { notifications: true, emailUpdates: true }
        },
        {
          id: this.generateId('user_'),
          name: 'Bob Smith',
          email: 'bob@user.com',
          password: 'bob123',
          phone: '+2222222222',
          address: '456 Oak Ave, Town',
          approved: false,
          createdAt: new Date().toISOString(),
          enrolledCourses: [],
          preferences: { notifications: true, emailUpdates: false }
        }
      );
    }

    // Seed courses if empty
    if (db.courses.length === 0 && db.institutes.length > 0) {
      const instituteId = db.institutes[0].id;
      db.courses.push(
        {
          id: this.generateId('course_'),
          title: 'Web Development Fundamentals',
          description: 'Learn HTML, CSS, and JavaScript from scratch',
          instituteId: instituteId,
          instituteName: db.institutes[0].name,
          price: 99.99,
          duration: '8 weeks',
          category: 'Technology',
          createdAt: new Date().toISOString(),
          enrolledStudents: 0,
          rating: 4.5,
          reviews: []
        },
        {
          id: this.generateId('course_'),
          title: 'Advanced JavaScript',
          description: 'Master modern JavaScript and frameworks',
          instituteId: instituteId,
          instituteName: db.institutes[0].name,
          price: 149.99,
          duration: '10 weeks',
          category: 'Technology',
          createdAt: new Date().toISOString(),
          enrolledStudents: 0,
          rating: 4.8,
          reviews: []
        }
      );

      // Update institute courses
      db.institutes[0].courses = db.courses.map(course => course.id);
      db.institutes[0].stats.totalCourses = db.courses.length;
    }

    const success = this.writeDB(db);
    return success ? 
      { ok: true, message: 'Sample data seeded successfully' } : 
      { ok: false, message: 'Failed to seed sample data' };
  }

  // Statistics and Analytics
  getSystemStats() {
    const db = this.readDB();
    return {
      totalInstitutes: db.institutes.length,
      totalUsers: db.users.length,
      totalCourses: db.courses.length,
      totalEnrollments: db.enrollments.length,
      approvedInstitutes: db.institutes.filter(inst => inst.approved).length,
      approvedUsers: db.users.filter(user => user.approved).length,
      pendingInstitutes: db.institutes.filter(inst => !inst.approved).length,
      pendingUsers: db.users.filter(user => !user.approved).length
    };
  }

  // Utility Methods
  exportData() {
    const db = this.readDB();
    // Remove passwords from export
    const exportDB = {
      ...db,
      admin: { ...db.admin, password: undefined },
      institutes: db.institutes.map(inst => ({ ...inst, password: undefined })),
      users: db.users.map(user => ({ ...user, password: undefined })),
      currentUser: db.currentUser ? { ...db.currentUser } : null
    };
    return exportDB;
  }

  importData(data) {
    try {
      // Basic validation
      if (!data.institutes || !data.users || !data.courses) {
        return { ok: false, message: 'Invalid data format' };
      }

      // Preserve current user session if exists
      const currentUser = this.getCurrentUser();
      data.currentUser = currentUser;

      const success = this.writeDB(data);
      return success ? 
        { ok: true, message: 'Data imported successfully' } : 
        { ok: false, message: 'Failed to import data' };
    } catch (error) {
      console.error('Import error:', error);
      return { ok: false, message: 'Error importing data' };
    }
  }
}

// Create and export singleton instance
export const localDB = new LocalDBAuth();
export default localDB;