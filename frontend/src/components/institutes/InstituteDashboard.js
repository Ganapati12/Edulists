// src/components/institutes/InstituteDashboard.js - FIXED IMPORT PATHS
import React, { useState, useEffect } from 'react';
import { useInstituteAuth } from '../../contexts/InstituteAuthContext';
import { database } from '../../services/database';

const InstituteDashboard = () => {
  const { 
    user, 
    getInstituteCourses, 
    getInstituteEnquiries, 
    getInstituteReviews,
    getInstituteStats,
    addCourse,
    updateProfile
  } = useInstituteAuth();

  const [courses, setCourses] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add course form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    duration: '',
    fees: '',
    seats: '',
    category: '',
    level: 'Undergraduate'
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = () => {
    setLoading(true);
    try {
      const instituteCourses = getInstituteCourses(user.id);
      const instituteEnquiries = getInstituteEnquiries();
      const instituteReviews = getInstituteReviews();
      const instituteStats = getInstituteStats();

      setCourses(instituteCourses);
      setEnquiries(instituteEnquiries);
      setReviews(instituteReviews);
      setStats(instituteStats || {});
    } catch (error) {
      console.error('Error loading institute dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    const result = await addCourse(courseForm);
    if (result.success) {
      setShowAddCourse(false);
      setCourseForm({
        title: '',
        description: '',
        duration: '',
        fees: '',
        seats: '',
        category: '',
        level: 'Undergraduate'
      });
      loadDashboardData();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading institute dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access the institute dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name} Dashboard</h1>
              <p className="text-gray-600">Manage your institute profile and courses</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Status: 
                <span className={`ml-2 font-semibold ${
                  user.status === 'approved' ? 'text-green-600' : 
                  user.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                </span>
              </p>
              {user.status === 'pending' && (
                <p className="text-sm text-yellow-600 mt-1">Awaiting admin approval</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['overview', 'courses', 'enquiries', 'reviews', 'profile'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCourses || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Enquiries</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalEnquiries || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageRating || '0.0'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.students || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Enquiries */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Enquiries</h3>
              </div>
              <div className="p-6">
                {enquiries.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No enquiries yet</p>
                ) : (
                  <div className="space-y-4">
                    {enquiries.slice(0, 5).map((enquiry) => (
                      <div key={enquiry.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{enquiry.name}</p>
                          <p className="text-sm text-gray-600">{enquiry.email}</p>
                          <p className="text-sm text-gray-700 mt-1">{enquiry.message}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(enquiry.createdAt).toLocaleDateString()}
                          </p>
                          <span className={`inline-block px-2 py-1 text-xs rounded ${
                            enquiry.status === 'new' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {enquiry.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Manage Courses</h3>
              <button
                onClick={() => setShowAddCourse(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add New Course
              </button>
            </div>

            {/* Add Course Modal */}
            {showAddCourse && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-medium mb-4">Add New Course</h3>
                  <form onSubmit={handleAddCourse}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Course Title</label>
                        <input
                          type="text"
                          name="title"
                          value={courseForm.title}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          name="description"
                          value={courseForm.description}
                          onChange={handleInputChange}
                          rows="3"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Duration</label>
                          <input
                            type="text"
                            name="duration"
                            value={courseForm.duration}
                            onChange={handleInputChange}
                            placeholder="e.g., 4 years"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Fees ($)</label>
                          <input
                            type="number"
                            name="fees"
                            value={courseForm.fees}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Seats</label>
                          <input
                            type="number"
                            name="seats"
                            value={courseForm.seats}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Level</label>
                          <select
                            name="level"
                            value={courseForm.level}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          >
                            <option value="Undergraduate">Undergraduate</option>
                            <option value="Postgraduate">Postgraduate</option>
                            <option value="Diploma">Diploma</option>
                            <option value="Certificate">Certificate</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                      >
                        Add Course
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCourse(false)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Courses List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {courses.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No courses added yet</p>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{course.title}</h4>
                          <p className="text-sm text-gray-600">{course.description}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            <span>Duration: {course.duration}</span>
                            <span>Fees: ${course.fees}</span>
                            <span>Seats: {course.seats}</span>
                            <span>Level: {course.level}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {course.enrolledStudents} enrolled
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-500">⭐</span>
                            <span>{course.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enquiries Tab */}
        {activeTab === 'enquiries' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Student Enquiries</h3>
            </div>
            <div className="p-6">
              {enquiries.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No enquiries received yet</p>
              ) : (
                <div className="space-y-4">
                  {enquiries.map((enquiry) => (
                    <div key={enquiry.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{enquiry.name}</h4>
                          <p className="text-sm text-gray-600">{enquiry.email} • {enquiry.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(enquiry.createdAt).toLocaleDateString()}
                          </p>
                          <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                            enquiry.status === 'new' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {enquiry.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{enquiry.message}</p>
                      <div className="flex gap-2">
                        <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                          Mark as Contacted
                        </button>
                        <button className="text-sm bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Student Reviews</h3>
            </div>
            <div className="p-6">
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{review.userName}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${
                                  i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                                }`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstituteDashboard;