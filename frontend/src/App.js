// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { InstituteAuthProvider, useInstituteAuth } from './contexts/InstituteAuthContext';

// Layout Components
import AdminLayout from './components/Layout/AdminLayout';
import InstituteLayout from './components/institutes/InstituteLayout'; 

// Common Components
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';

// Admin Components
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import InstituteApproval from './components/Admin/InstituteApproval';
import UserManagement from './components/Admin/UserManagement';
import PlatformAnalytics from './components/Admin/PlatformAnalytics';
import QualityControl from './components/Admin/QualityControl';

// Institute Components
import InstituteLogin from './components/institutes/InstituteLogin';
import InstituteRegister from './components/institutes/InstituteRegister';
import InstituteDashboard from './components/institutes/InstituteDashboard';
import InstituteCourses from './components/institutes/InstituteCourses';
import InstituteEnquiries from './components/institutes/InstituteEnquiries';
import InstituteProfile from './components/institutes/InstituteProfile';
import InstituteReviews from './components/institutes/InstituteReviews';
import InstituteSettings from './components/institutes/InstituteSettings';

// User Components
import UserRegister from './pages/UserRegister';
import UserLogin from './pages/UserLogin';
import UserDashboard from './pages/UserDashboard';
import UserPendingApproval from './pages/UserPendingApproval';
import AdminPanel from './pages/AdminPanel';

// Public Components
import LandingPage from './pages/LandingPage';
import HomePage from './components/HomePage';
import About from './components/About';
import Contact from './components/Contact';
import InstituteList from './components/InstituteList';
import InstituteDetail from './components/InstituteDetail';

// Layout Components
const PublicLayout = ({ children, showHeader = true }) => (
  <div className="min-h-screen bg-gray-50">
    {showHeader && <Header />}
    {children}
  </div>
);

const UserLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    {children}
  </div>
);

const InstituteLayoutWrapper = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <InstituteLayout>
      {children}
    </InstituteLayout>
  </div>
);

// Auth-based redirect components
const AdminRedirect = () => {
  const { user } = useAuth();
  return user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />;
};

const UserRedirect = () => {
  const { user } = useAuth();
  
  // If user is already logged in and approved, redirect to dashboard
  if (user && user.role === 'user') {
    if (user.status === 'approved') {
      return <Navigate to="/user/dashboard" replace />;
    } else if (user.status === 'pending') {
      return <Navigate to="/user/pending-approval" replace />;
    }
  }
  
  return <UserLogin />;
};

// User Status Check Component - FIXED VERSION
const UserStatusCheck = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking user status..." />;
  }

  if (!user) {
    return <Navigate to="/user/login" replace />;
  }

  if (user.status === 'pending') {
    return <Navigate to="/user/pending-approval" replace />;
  }

  if (user.status === 'rejected') {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 mx-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">❌</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Rejected</h1>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">
                  {user.rejectionReason || 'Your account registration has been rejected. Please contact support for more information.'}
                </p>
              </div>
              <p className="text-gray-600 mb-6">
                If you believe this is a mistake, please contact our support team.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = 'mailto:support@example.com'} 
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Contact Support
                </button>
                <button 
                  onClick={() => window.location.href = '/user/login'} 
                  className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  // Simple check for approved status - FIXED: removed isUserApproved function call
  if (user.status !== 'approved') {
    return <Navigate to="/user/pending-approval" replace />;
  }

  return children;
};

// Institute Protected Route Component
const InstituteProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useInstituteAuth();

  if (loading) {
    return <LoadingSpinner message="Checking institute permissions..." />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/institute/login" replace />;
  }

  return children;
};

// Institute Status Check Component
const InstituteStatusCheck = ({ children }) => {
  const { isApproved, loading } = useInstituteAuth();

  if (loading) {
    return <LoadingSpinner message="Checking institute status..." />;
  }

  if (!isApproved()) {
    return <Navigate to="/institute/pending-approval" replace />;
  }

  return children;
};

// Institute Redirect Component
const InstituteRedirect = () => {
  const { instituteUser, isAuthenticated, isApproved, loading } = useInstituteAuth();

  if (loading) {
    return <LoadingSpinner message="Checking institute authentication..." />;
  }
  
  if (isAuthenticated() && instituteUser) {
    return isApproved() ? 
      <Navigate to="/institute/dashboard" replace /> : 
      <Navigate to="/institute/pending-approval" replace />;
  }
  return <InstituteLogin />;
};

// Institute Pending Approval Component
const InstitutePendingApproval = () => (
  <PublicLayout>
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 mx-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⏳</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Institute Pending Approval</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              Your institute registration is currently pending administrator approval. 
              Once approved, you'll have full access to manage your courses, enquiries, and profile.
            </p>
          </div>
          <p className="text-gray-600 mb-2">
            You'll receive an email notification when your institute is approved.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            This typically takes 24-48 hours.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Check Status
            </button>
            <button 
              onClick={() => window.location.href = '/institute/login'} 
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
);

// Institute Routes Component
const InstituteRoutes = () => {
  return (
    <InstituteAuthProvider>
      <Routes>
        {/* Institute Public Routes */}
        <Route 
          path="login" 
          element={
            <PublicLayout>
              <InstituteRedirect />
            </PublicLayout>
          } 
        />

        <Route 
          path="register" 
          element={
            <PublicLayout>
              <InstituteRegister />
            </PublicLayout>
          } 
        />

        {/* Pending Approval Route */}
        <Route 
          path="pending-approval" 
          element={
            <InstituteProtectedRoute>
              <PublicLayout>
                <InstitutePendingApproval />
              </PublicLayout>
            </InstituteProtectedRoute>
          } 
        />

        {/* Institute Protected Routes */}
        <Route 
          path="dashboard" 
          element={
            <InstituteProtectedRoute>
              <InstituteStatusCheck>
                <InstituteLayoutWrapper>
                  <InstituteDashboard />
                </InstituteLayoutWrapper>
              </InstituteStatusCheck>
            </InstituteProtectedRoute>
          } 
        />

        <Route 
          path="courses" 
          element={
            <InstituteProtectedRoute>
              <InstituteStatusCheck>
                <InstituteLayoutWrapper>
                  <InstituteCourses />
                </InstituteLayoutWrapper>
              </InstituteStatusCheck>
            </InstituteProtectedRoute>
          } 
        />

        <Route 
          path="enquiries" 
          element={
            <InstituteProtectedRoute>
              <InstituteStatusCheck>
                <InstituteLayoutWrapper>
                  <InstituteEnquiries />
                </InstituteLayoutWrapper>
              </InstituteStatusCheck>
            </InstituteProtectedRoute>
          } 
        />

        <Route 
          path="profile" 
          element={
            <InstituteProtectedRoute>
              <InstituteStatusCheck>
                <InstituteLayoutWrapper>
                  <InstituteProfile />
                </InstituteLayoutWrapper>
              </InstituteStatusCheck>
            </InstituteProtectedRoute>
          } 
        />

        <Route 
          path="reviews" 
          element={
            <InstituteProtectedRoute>
              <InstituteStatusCheck>
                <InstituteLayoutWrapper>
                  <InstituteReviews />
                </InstituteLayoutWrapper>
              </InstituteStatusCheck>
            </InstituteProtectedRoute>
          } 
        />

        <Route 
          path="settings" 
          element={
            <InstituteProtectedRoute>
              <InstituteStatusCheck>
                <InstituteLayoutWrapper>
                  <InstituteSettings />
                </InstituteLayoutWrapper>
              </InstituteStatusCheck>
            </InstituteProtectedRoute>
          } 
        />

        {/* Default institute route */}
        <Route path="" element={<Navigate to="login" replace />} />
      </Routes>
    </InstituteAuthProvider>
  );
};

// Error Pages
const UnauthorizedPage = () => (
  <PublicLayout>
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized Access</h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page with your current role.
        </p>
        <div className="space-y-3">
          <button 
            onClick={() => window.history.back()} 
            className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
          <button 
            onClick={() => window.location.href = '/'} 
            className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  </PublicLayout>
);

const NotFoundPage = () => (
  <PublicLayout>
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔍</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-3">
          <button 
            onClick={() => window.location.href = '/'} 
            className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
          <button 
            onClick={() => window.history.back()} 
            className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  </PublicLayout>
);

// User Profile Component
const UserProfile = () => {
  const { user } = useAuth();

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">User Profile</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Full Name</label>
                    <p className="mt-1 text-gray-900">{user?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <p className="mt-1 text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Phone</label>
                    <p className="mt-1 text-gray-900">{user?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Account Status</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user?.status === 'approved' ? 'bg-green-100 text-green-800' :
                        user?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user?.status === 'approved' ? '✅ Approved' : 
                         user?.status === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Account Settings</h2>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                    Change Password
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition-colors">
                    Notification Settings
                  </button>
                  <button className="w-full border border-red-300 text-red-700 py-2 px-4 rounded hover:bg-red-50 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

// User Enquiries Component
const UserEnquiries = () => (
  <UserLayout>
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Enquiries</h1>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Enquiries Yet</h3>
            <p className="text-gray-500 mb-6">
              Your enquiries to institutes will appear here once you start contacting them.
            </p>
            <button 
              onClick={() => window.location.href = '/institutes'} 
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Institutes
            </button>
          </div>
        </div>
      </div>
    </div>
  </UserLayout>
);

// Main App Content Component
const AppContent = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            <PublicLayout showHeader={false}>
              <LandingPage />
            </PublicLayout>
          } 
        />

        <Route 
          path="/home" 
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          } 
        />

        <Route 
          path="/about" 
          element={
            <PublicLayout>
              <About />
            </PublicLayout>
          } 
        />

        <Route 
          path="/contact" 
          element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          } 
        />

        {/* Institute Public Pages */}
        <Route 
          path="/institutes" 
          element={
            <PublicLayout>
              <InstituteList />
            </PublicLayout>
          } 
        />

        <Route 
          path="/institutes/:id" 
          element={
            <PublicLayout>
              <InstituteDetail />
            </PublicLayout>
          } 
        />

        {/* Authentication Routes with Auto-Redirect */}
        <Route 
          path="/admin/login" 
          element={
            <PublicLayout>
              <AdminRedirect />
            </PublicLayout>
          } 
        />

        <Route 
          path="/user/register" 
          element={
            <PublicLayout>
              <UserRegister />
            </PublicLayout>
          } 
        />

        <Route 
          path="/user/login" 
          element={
            <PublicLayout>
              <UserRedirect />
            </PublicLayout>
          } 
        />

        {/* Institute Routes */}
        <Route path="/institute/*" element={<InstituteRoutes />} />

        {/* Admin Protected Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/approvals" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <InstituteApproval />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <UserManagement />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/analytics" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <PlatformAnalytics />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/quality-control" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <QualityControl />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/panel" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <AdminPanel />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        {/* User Protected Routes */}
        {/* Primary dashboard route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserStatusCheck>
                <UserLayout>
                  <UserDashboard />
                </UserLayout>
              </UserStatusCheck>
            </ProtectedRoute>
          } 
        />

        {/* Alternative user dashboard route */}
        <Route 
          path="/user/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserStatusCheck>
                <UserLayout>
                  <UserDashboard />
                </UserLayout>
              </UserStatusCheck>
            </ProtectedRoute>
          } 
        />

        {/* User profile route */}
        <Route 
          path="/user/profile" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserStatusCheck>
                <UserProfile />
              </UserStatusCheck>
            </ProtectedRoute>
          } 
        />

        {/* User pending approval route */}
        <Route 
          path="/user/pending-approval" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserPendingApproval />
            </ProtectedRoute>
          } 
        />

        {/* User enquiries route */}
        <Route 
          path="/user/enquiries" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserStatusCheck>
                <UserEnquiries />
              </UserStatusCheck>
            </ProtectedRoute>
          } 
        />

        {/* Search route */}
        <Route 
          path="/search" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserStatusCheck>
                <UserLayout>
                  <InstituteList />
                </UserLayout>
              </UserStatusCheck>
            </ProtectedRoute>
          } 
        />

        {/* Utility Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Redirects for old paths */}
        <Route path="/login" element={<Navigate to="/user/login" replace />} />
        <Route path="/register" element={<Navigate to="/user/register" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/user" element={<Navigate to="/user/login" replace />} />

        {/* Legacy redirects */}
        <Route path="/institutes/dashboard" element={<Navigate to="/institute/dashboard" replace />} />
        <Route path="/institutes/login" element={<Navigate to="/institute/login" replace />} />
        <Route path="/institutes/register" element={<Navigate to="/institute/register" replace />} />

        {/* Catch-all route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;