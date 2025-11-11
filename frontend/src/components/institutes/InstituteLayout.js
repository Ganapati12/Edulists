import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useInstituteAuth } from '../../contexts/InstituteAuthContext';
import {
  Building,
  BookOpen,
  MessageSquare,
  Star,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  AlertCircle,
  Settings,
  Home,
  Users,
  FileText
} from 'lucide-react';

const InstituteLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout, loading, isAuthenticated, isApproved } = useInstituteAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile, sidebarOpen]);

  // Safe navigation functions
  const safeIsAuthenticated = useCallback(() => {
    return isAuthenticated ? isAuthenticated() : false;
  }, [isAuthenticated]);

  const safeIsApproved = useCallback(() => {
    return isApproved ? isApproved() : false;
  }, [isApproved]);

  // Redirect if not authenticated or not approved
  useEffect(() => {
    if (!loading) {
      const authenticated = safeIsAuthenticated();
      const approved = safeIsApproved();
      
      if (!authenticated || !approved) {
        console.log('🚫 Access denied - Redirecting to login');
        console.log('Authenticated:', authenticated);
        console.log('Approved:', approved);
        navigate('/institute/login');
      }
    }
  }, [user, loading, safeIsAuthenticated, safeIsApproved, navigate]);

  const navigation = [
    { name: 'Dashboard', href: '/institute/dashboard', icon: BarChart3 },
    { name: 'Courses', href: '/institute/courses', icon: BookOpen },
    { name: 'Students', href: '/institute/students', icon: Users },
    { name: 'Enquiries', href: '/institute/enquiries', icon: MessageSquare },
    { name: 'Reviews', href: '/institute/reviews', icon: Star },
    { name: 'Reports', href: '/institute/reports', icon: FileText },
    { name: 'Profile', href: '/institute/profile', icon: User },
    { name: 'Settings', href: '/institute/settings', icon: Settings },
  ];

  const quickActions = [
    { name: 'Add Course', href: '/institute/courses/new', icon: BookOpen },
    { name: 'View Enquiries', href: '/institute/enquiries', icon: MessageSquare },
    { name: 'Institute Home', href: '/institute', icon: Home },
  ];

  const handleLogout = useCallback(() => {
    if (logout) {
      logout();
    }
    navigate('/institute/login');
  }, [logout, navigate]);

  const isActive = useCallback((path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }, [location.pathname]);

  const getActivePageTitle = useCallback(() => {
    const activeNav = navigation.find(item => isActive(item.href));
    if (activeNav) return activeNav.name;
    
    // Fallback for nested routes
    if (location.pathname.includes('/courses/')) return 'Course Details';
    if (location.pathname.includes('/students/')) return 'Student Details';
    
    return 'Dashboard';
  }, [location.pathname, navigation, isActive]);

  // Safe user data access - FIXED: Handle null/undefined user and prevent object rendering
  const getUserInitial = useCallback(() => {
    if (!user || typeof user !== 'object') return 'I';
    const name = user?.name;
    if (!name || typeof name !== 'string') return 'I';
    return name.charAt(0).toUpperCase();
  }, [user]);

  const getUserFirstName = useCallback(() => {
    if (!user || typeof user !== 'object') return 'Institute Admin';
    const name = user?.name;
    if (!name || typeof name !== 'string') return 'Institute Admin';
    return name.split(' ')[0] || 'Institute Admin';
  }, [user]);

  // Safe user property accessors that return strings only
  const getUserName = useCallback(() => {
    if (!user || typeof user !== 'object') return 'Institute';
    const name = user?.name;
    return (name && typeof name === 'string') ? name : 'Institute';
  }, [user]);

  const getUserEmail = useCallback(() => {
    if (!user || typeof user !== 'object') return 'No email';
    const email = user?.email;
    return (email && typeof email === 'string') ? email : 'No email';
  }, [user]);

  // Safe user status check
  const getUserStatus = useCallback(() => {
    if (!user || typeof user !== 'object') return 'unknown';
    const status = user?.status || user?.approvalStatus;
    return (status && typeof status === 'string') ? status : 'unknown';
  }, [user]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading Institute Portal...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we prepare your dashboard</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated or not approved
  const authenticated = safeIsAuthenticated();
  const approved = safeIsApproved();
  
  if (!authenticated || !approved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6 text-lg">
              {!authenticated 
                ? 'You need to log in to access the institute portal.' 
                : 'Your institute account is pending approval. Please wait for administrator approval.'}
            </p>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/institute/login')}
                className="w-full bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Go to Login
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-600 text-white px-8 py-4 rounded-xl hover:bg-gray-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Back to Homepage
              </button>
            </div>
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Demo Access:</strong> Use 'admin@institute.com' with any password for instant approved access.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out lg:static lg:inset-0 flex flex-col`}>
        
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center space-x-3">
            <Building className="w-10 h-10" />
            <div>
              <span className="text-2xl font-bold">EduList</span>
              <p className="text-blue-100 text-sm">Institute Portal</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-blue-100 hover:text-white hover:bg-blue-500 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info - FIXED: Using safe accessors that return strings only */}
        <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-blue-200">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-gray-900 truncate">
                {getUserName()}
              </p>
              <p className="text-sm text-gray-600 truncate">{getUserEmail()}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-block px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium border border-green-200">
                  ✓ Approved
                </span>
                <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium border border-blue-200">
                  Institute
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.name}
                  to={action.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
                >
                  <Icon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-600" />
                  {action.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-6 py-4 space-y-1 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Navigation</h3>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  active
                    ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${
                  active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                {item.name}
                {active && (
                  <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200 shadow-sm border border-gray-200 hover:border-red-200 group"
          >
            <LogOut className="w-4 h-4 mr-2 text-gray-400 group-hover:text-red-600" />
            Logout
          </button>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              EduList v2.0 • Institute Portal
            </p>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header - FIXED: Using safe accessors that return strings only */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors mr-2"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="ml-2 lg:ml-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  {getActivePageTitle()}
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Welcome back, {getUserFirstName()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                  placeholder="Search..."
                />
              </div>

              {/* Notifications */}
              <button 
                className="relative p-2 text-gray-400 hover:text-gray-500 rounded-xl hover:bg-gray-100 transition-colors group"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* User avatar - FIXED: Using safe accessors that return strings only */}
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{getUserName()}</p>
                  <p className="text-xs text-gray-500">Institute Admin</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {getUserInitial()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default InstituteLayout;