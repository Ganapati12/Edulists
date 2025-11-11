// src/components/institutes/InstituteCourses.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstituteLayout from './InstituteLayout';
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Clock,
  Users,
  DollarSign,
  Search,
  Filter,
  Eye,
  MoreVertical,
  Star,
  BarChart3
} from 'lucide-react';

const InstituteCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockCourses = [
        {
          _id: '1',
          name: 'Computer Science Engineering',
          category: 'Technology',
          duration: '4 years',
          fees: 80000,
          seats: 120,
          enrolled: 95,
          rating: 4.8,
          status: 'active',
          description: 'Comprehensive computer science program covering programming, algorithms, and software development',
          image: '💻',
          createdAt: '2024-01-15',
          revenue: 7600000
        },
        {
          _id: '2',
          name: 'Business Administration',
          category: 'Management',
          duration: '3 years',
          fees: 60000,
          seats: 80,
          enrolled: 65,
          rating: 4.6,
          status: 'active',
          description: 'Business management and administration with focus on leadership and strategy',
          image: '📊',
          createdAt: '2024-01-10',
          revenue: 3900000
        },
        {
          _id: '3',
          name: 'Digital Marketing Mastery',
          category: 'Marketing',
          duration: '6 months',
          fees: 25000,
          seats: 50,
          enrolled: 42,
          rating: 4.9,
          status: 'active',
          description: 'Learn SEO, social media marketing, and digital advertising strategies',
          image: '📱',
          createdAt: '2024-01-20',
          revenue: 1050000
        },
        {
          _id: '4',
          name: 'Medical Fundamentals',
          category: 'Medical',
          duration: '5 years',
          fees: 120000,
          seats: 100,
          enrolled: 78,
          rating: 4.7,
          status: 'active',
          description: 'Comprehensive medical education with practical training',
          image: '⚕️',
          createdAt: '2024-01-05',
          revenue: 9360000
        }
      ];
      
      setCourses(mockCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Technology', 'Management', 'Marketing', 'Medical', 'Arts', 'Science'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      // Delete course logic
      setCourses(courses.filter(course => course._id !== courseId));
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleViewAnalytics = (courseId) => {
    navigate(`/institute/courses/${courseId}/analytics`);
  };

  const stats = {
    totalCourses: courses.length,
    totalStudents: courses.reduce((sum, course) => sum + course.enrolled, 0),
    totalRevenue: courses.reduce((sum, course) => sum + course.revenue, 0),
    activeCourses: courses.filter(course => course.status === 'active').length
  };

  if (loading) {
    return (
      <InstituteLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-24 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </InstituteLayout>
    );
  }

  return (
    <InstituteLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
            <p className="text-gray-600 mt-2">Manage your institute's course offerings and track performance</p>
          </div>
          <button
            onClick={() => {
              setEditingCourse(null);
              setShowForm(true);
            }}
            className="mt-4 lg:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Course
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCourses}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard 
                key={course._id} 
                course={course} 
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewAnalytics={handleViewAnalytics}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {filteredCourses.map(course => (
              <CourseListItem 
                key={course._id} 
                course={course} 
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewAnalytics={handleViewAnalytics}
              />
            ))}
          </div>
        )}

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or create a new course.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Your First Course
            </button>
          </div>
        )}

        {/* Add/Edit Course Form Modal */}
        {showForm && (
          <CourseForm
            course={editingCourse}
            onClose={() => {
              setShowForm(false);
              setEditingCourse(null);
            }}
            onSave={(courseData) => {
              // Handle save logic
              if (editingCourse) {
                // Update existing course
                setCourses(courses.map(c => c._id === editingCourse._id ? { ...c, ...courseData } : c));
              } else {
                // Add new course
                const newCourse = {
                  _id: Date.now().toString(),
                  ...courseData,
                  enrolled: 0,
                  rating: 0,
                  status: 'active',
                  image: '📚',
                  createdAt: new Date().toISOString(),
                  revenue: 0
                };
                setCourses([...courses, newCourse]);
              }
              setShowForm(false);
              setEditingCourse(null);
            }}
          />
        )}
      </div>
    </InstituteLayout>
  );
};

// Course Card Component for Grid View
const CourseCard = ({ course, onEdit, onDelete, onViewAnalytics }) => {
  const enrollmentPercentage = (course.enrolled / course.seats) * 100;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-3xl">{course.image}</div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              course.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {course.status}
            </span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Category:</span>
            <span className="font-medium">{course.category}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">{course.duration}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Fees:</span>
            <span className="font-medium">₹{course.fees}/year</span>
          </div>
        </div>

        {/* Enrollment Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Enrollment</span>
            <span>{course.enrolled}/{course.seats} ({enrollmentPercentage.toFixed(1)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${Math.min(enrollmentPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm mb-4">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span>{course.rating}</span>
          </div>
          <div className="flex items-center text-green-600">
            <DollarSign className="w-4 h-4 mr-1" />
            <span>₹{(course.revenue / 100000).toFixed(1)}L</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onViewAnalytics(course._id)}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 flex items-center justify-center text-sm"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Analytics
          </button>
          <button
            onClick={() => onEdit(course)}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </button>
          <button
            onClick={() => onDelete(course._id)}
            className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 flex items-center justify-center text-sm"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Course List Item Component for List View
const CourseListItem = ({ course, onEdit, onDelete, onViewAnalytics }) => {
  const enrollmentPercentage = (course.enrolled / course.seats) * 100;
  
  return (
    <div className="border-b last:border-b-0 hover:bg-gray-50">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">{course.image}</div>
            <div>
              <h3 className="font-semibold text-gray-900">{course.name}</h3>
              <p className="text-gray-600 text-sm">{course.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-semibold text-gray-900">₹{course.fees}/year</p>
              <p className="text-gray-600 text-sm">{course.duration}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onViewAnalytics(course._id)}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="View Analytics"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(course)}
                className="p-2 text-blue-600 hover:text-blue-800"
                title="Edit Course"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(course._id)}
                className="p-2 text-red-600 hover:text-red-800"
                title="Delete Course"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <span>Category: {course.category}</span>
            <span>Students: {course.enrolled}/{course.seats}</span>
            <span>Rating: {course.rating} ⭐</span>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${
            course.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {course.status}
          </span>
        </div>
      </div>
    </div>
  );
};

// Course Form Component (same as before with improvements)
const CourseForm = ({ course, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: course?.name || '',
    category: course?.category || '',
    duration: course?.duration || '',
    fees: course?.fees || '',
    seats: course?.seats || '',
    description: course?.description || ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Course name is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.duration.trim()) newErrors.duration = 'Duration is required';
    if (!form.fees || form.fees <= 0) newErrors.fees = 'Valid fees amount is required';
    if (!form.seats || form.seats <= 0) newErrors.seats = 'Valid seats number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(form);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">
            {course ? 'Edit Course' : 'Add New Course'}
          </h3>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter course name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({...form, category: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Category</option>
              <option value="Technology">Technology</option>
              <option value="Management">Management</option>
              <option value="Marketing">Marketing</option>
              <option value="Medical">Medical</option>
              <option value="Arts">Arts</option>
              <option value="Science">Science</option>
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration *
              </label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({...form, duration: e.target.value})}
                placeholder="e.g., 4 years, 6 months"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.duration ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fees (₹ per year) *
              </label>
              <input
                type="number"
                value={form.fees}
                onChange={(e) => setForm({...form, fees: parseInt(e.target.value) || ''})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.fees ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fees && <p className="text-red-500 text-sm mt-1">{errors.fees}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Seats *
            </label>
            <input
              type="number"
              value={form.seats}
              onChange={(e) => setForm({...form, seats: parseInt(e.target.value) || ''})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.seats ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.seats && <p className="text-red-500 text-sm mt-1">{errors.seats}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the course content, objectives, and benefits..."
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {course ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstituteCourses;