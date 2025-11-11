// src/components/Admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingInstitutes, setPendingInstitutes] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allInstitutes, setAllInstitutes] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInstitutes: 0,
    pendingApprovals: 0,
    totalCourses: 0,
    activeUsers: 0,
    rejectedInstitutes: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();

  const user = {
    name: 'System Administrator',
    role: 'Administrator',
    avatar: '👨‍💼'
  };

  // Mock data
  const mockPendingUsers = [
    {
      id: 'user1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'student',
      createdAt: '2024-01-15',
      status: 'pending',
      documents: ['id_proof.pdf', 'education_certificate.pdf']
    },
    {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'teacher',
      createdAt: '2024-01-16',
      status: 'pending',
      documents: ['id_proof.pdf', 'teaching_certificate.pdf']
    }
  ];

  const mockPendingInstitutes = [
    {
      id: 'inst1',
      name: 'Tech University',
      category: 'University',
      email: 'admin@techuniversity.edu',
      phone: '+1-555-0101',
      address: {
        street: '123 Education St',
        city: 'Boston',
        state: 'MA',
        country: 'USA'
      },
      established: '1995',
      accreditation: 'Regional',
      documents: ['license.pdf', 'accreditation.pdf'],
      createdAt: '2024-01-10',
      status: 'pending'
    }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setLoading(true);
    setTimeout(() => {
      setPendingUsers(mockPendingUsers);
      setPendingInstitutes(mockPendingInstitutes);
      
      setStats({
        totalUsers: 1247,
        totalInstitutes: 89,
        pendingApprovals: mockPendingUsers.length + mockPendingInstitutes.length,
        totalCourses: 156,
        activeUsers: 1189,
        rejectedInstitutes: 3
      });
      
      setLoading(false);
    }, 1000);
  };

  const handleApproveUser = (userId) => {
    const user = pendingUsers.find(u => u.id === userId);
    if (user) {
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1
      }));
    }
  };

  const handleRejectUser = (userId) => {
    const user = pendingUsers.find(u => u.id === userId);
    if (user) {
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1
      }));
    }
  };

  const handleApproveInstitute = (instituteId) => {
    const institute = pendingInstitutes.find(inst => inst.id === instituteId);
    if (institute) {
      setPendingInstitutes(prev => prev.filter(inst => inst.id !== instituteId));
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1
      }));
    }
  };

  const handleRejectInstitute = (instituteId) => {
    const institute = pendingInstitutes.find(inst => inst.id === instituteId);
    if (institute) {
      setPendingInstitutes(prev => prev.filter(inst => inst.id !== instituteId));
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1,
        rejectedInstitutes: prev.rejectedInstitutes + 1
      }));
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminSession');
    navigate('/');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚪</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to logout from the admin dashboard?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelLogout}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-xl transition-all duration-300 relative z-40`}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-gray-800">EduPlatform</h1>
                <p className="text-xs text-gray-500 font-medium">Admin Console</p>
              </div>
            )}
          </div>
        </div>
        
        <nav className="p-4">
          <div className="space-y-1">
            {[
              { id: 'overview', icon: '📊', label: 'Dashboard' },
              { id: 'institutes', icon: '✅', label: 'Institute Approvals' },
              { id: 'users', icon: '👥', label: 'User Management' },
              { id: 'analytics', icon: '📈', label: 'Analytics' },
              { id: 'quality', icon: '🛡️', label: 'Quality Control' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && (
                  <span className="ml-3 font-medium">{item.label}</span>
                )}
              </button>
            ))}
            
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center px-4 py-3 text-left rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 mt-8"
            >
              <span className="text-lg">🚪</span>
              {sidebarOpen && (
                <span className="ml-3 font-medium">Logout</span>
              )}
            </button>
          </div>
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
        >
          {sidebarOpen ? '‹' : '›'}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header - Clean and Simple */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'overview' && 'Dashboard Overview'}
                  {activeTab === 'institutes' && 'Institute Management'}
                  {activeTab === 'users' && 'User Management'}
                  {activeTab === 'analytics' && 'Platform Analytics'}
                  {activeTab === 'quality' && 'Quality Control'}
                </h1>
                <p className="text-gray-600 mt-2">
                  Welcome back, {user.name}! {
                    activeTab === 'overview' && 'Here is your system overview.'}
                  {activeTab === 'institutes' && 'Manage institute registrations and approvals.'}
                  {activeTab === 'users' && 'Manage user accounts and permissions.'}
                  {activeTab === 'analytics' && 'View system analytics and performance metrics.'}
                  {activeTab === 'quality' && 'Monitor and maintain system quality standards.'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {user.avatar}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Users', value: stats.totalUsers, change: '+12%', icon: '👥', color: 'blue' },
                  { label: 'Total Institutes', value: stats.totalInstitutes, change: '+8%', icon: '🏫', color: 'green' },
                  { label: 'Pending Approvals', value: stats.pendingApprovals, change: 'Attention', icon: '⏳', color: 'yellow' },
                  { label: 'Total Courses', value: stats.totalCourses, change: '+5%', icon: '📚', color: 'purple' }
                ].map((stat, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <p className={`text-xs font-medium ${
                          stat.color === 'yellow' ? 'text-yellow-600' : 
                          stat.color === 'green' ? 'text-green-600' : 
                          stat.color === 'purple' ? 'text-purple-600' : 'text-blue-600'
                        }`}>
                          {stat.change}
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl ${
                        stat.color === 'blue' ? 'bg-blue-50' :
                        stat.color === 'green' ? 'bg-green-50' :
                        stat.color === 'yellow' ? 'bg-yellow-50' : 'bg-purple-50'
                      }`}>
                        <span className="text-2xl">{stat.icon}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pending Approvals Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Users */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Pending User Approvals</h3>
                        <p className="text-sm text-gray-600">{pendingUsers.length} users awaiting review</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                        {pendingUsers.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    {pendingUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">🎉</div>
                        <p className="text-gray-500 font-medium">All caught up!</p>
                        <p className="text-sm text-gray-400">No pending user approvals</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                <p className="text-xs text-gray-500 capitalize">Role: {user.role}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApproveUser(user.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectUser(user.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pending Institutes */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Pending Institute Approvals</h3>
                        <p className="text-sm text-gray-600">{pendingInstitutes.length} institutes awaiting review</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                        {pendingInstitutes.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    {pendingInstitutes.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">✅</div>
                        <p className="text-gray-500 font-medium">All clear!</p>
                        <p className="text-sm text-gray-400">No pending institute approvals</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingInstitutes.map((institute) => (
                          <div key={institute.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {institute.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{institute.name}</p>
                                <p className="text-sm text-gray-600">{institute.category}</p>
                                <p className="text-xs text-gray-500">{institute.address.city}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApproveInstitute(institute.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectInstitute(institute.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs remain the same as previous implementation */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">User Management</h3>
                <p className="text-gray-600">User management features coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'institutes' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🏫</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Institute Management</h3>
                <p className="text-gray-600">Institute management features coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics</h3>
                <p className="text-gray-600">Analytics features coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Control</h3>
                <p className="text-gray-600">Quality control features coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;