// components/Navigation.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, BookOpen, MessageSquare, Star, User, 
  Settings, LogOut, Menu, X, Building,
  Shield, Users, FileCheck, Search, BarChart3,
  Calendar, Heart, Bell, ChevronDown, Globe,
  CreditCard, HelpCircle, Mail, GraduationCap,
  TrendingUp, Eye, CheckCircle, Bookmark,
  PieChart, FileText, Layers, Target,
  Clock,
  AlertTriangle
} from 'lucide-react';

// Constants for better maintainability
const USER_ROLES = {
  ADMIN: 'admin',
  INSTITUTE: 'institute',
  STUDENT: 'student'
};

const USER_STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending',
  REJECTED: 'rejected'
};

const Navigation = ({ user, onLogout, notificationCount = 0 }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const sidebarRef = useRef(null);

  // Debug user data
  useEffect(() => {
    console.log('👤 Navigation - User data:', user);
    console.log('📍 Navigation - Current path:', location.pathname);
  }, [user, location.pathname]);

  // Close menus when route changes
  useEffect(() => {
    setSidebarOpen(false);
    setProfileMenuOpen(false);
    setActiveSubmenu(null);
  }, [location]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  const handleLogout = useCallback(() => {
    console.log('🚪 Logging out user:', user?.name);
    onLogout();
    navigate('/');
    setProfileMenuOpen(false);
  }, [onLogout, navigate, user]);

  const handleNavigation = useCallback((path) => {
    console.log('🧭 Navigating to:', path);
    navigate(path);
    setSidebarOpen(false);
    setProfileMenuOpen(false);
    setActiveSubmenu(null);
  }, [navigate]);

  const toggleSubmenu = useCallback((menu) => {
    setActiveSubmenu(activeSubmenu === menu ? null : menu);
  }, [activeSubmenu]);

  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);
  const isActivePath = useCallback((path) => location.pathname.startsWith(path), [location.pathname]);

  // Memoized navigation items based on user role and status
  const navItems = useMemo(() => {
    if (!user) return [];

    const baseItems = [
      { 
        path: '/dashboard', 
        label: 'Dashboard', 
        icon: Home, 
        badge: null 
      }
    ];

    // Institute-specific navigation based on approval status
    if (user?.type === USER_ROLES.INSTITUTE || user?.role === USER_ROLES.INSTITUTE) {
      const instituteStatus = user.status || user.approvalStatus;
      
      console.log('🏫 Institute navigation - Status:', instituteStatus);
      
      const instituteItems = [
        ...baseItems,
        { 
          path: '/institute/courses', 
          label: 'Courses', 
          icon: BookOpen, 
          badge: instituteStatus === USER_STATUS.APPROVED ? '3' : null,
          disabled: instituteStatus !== USER_STATUS.APPROVED
        },
        { 
          path: '/institute/enquiries', 
          label: 'Enquiries', 
          icon: MessageSquare, 
          badge: instituteStatus === USER_STATUS.APPROVED ? '12' : null,
          disabled: instituteStatus !== USER_STATUS.APPROVED
        },
        { 
          path: '/institute/reviews', 
          label: 'Reviews', 
          icon: Star, 
          badge: instituteStatus === USER_STATUS.APPROVED ? '8' : null,
          disabled: instituteStatus !== USER_STATUS.APPROVED
        },
      ];

      // Only show calendar and performance for approved institutes
      if (instituteStatus === USER_STATUS.APPROVED) {
        instituteItems.push(
          { 
            path: '/institute/calendar', 
            label: 'Calendar', 
            icon: Calendar, 
            badge: null 
          },
          { 
            path: '/institute/performance', 
            label: 'Performance', 
            icon: TrendingUp, 
            badge: null 
          }
        );
      }

      // Show pending approval notice
      if (instituteStatus === USER_STATUS.PENDING) {
        instituteItems.push(
          { 
            path: '/institute/pending-approval', 
            label: 'Pending Approval', 
            icon: Clock, 
            badge: '!',
            special: true
          }
        );
      }

      return instituteItems;
    } 
    // Admin navigation
    else if (user?.type === USER_ROLES.ADMIN || user?.role === USER_ROLES.ADMIN) {
      return [
        ...baseItems,
        { 
          path: '/admin/approvals', 
          label: 'Approvals', 
          icon: FileCheck, 
          badge: '5' 
        },
        { 
          path: '/admin/institutes', 
          label: 'Institutes', 
          icon: Building, 
          badge: null 
        },
        { 
          path: '/admin/users', 
          label: 'Users', 
          icon: Users, 
          badge: null 
        },
        { 
          path: '/admin/analytics', 
          label: 'Analytics', 
          icon: BarChart3, 
          badge: null 
        },
        { 
          path: '/admin/reports', 
          label: 'Reports', 
          icon: FileText, 
          badge: '3' 
        },
      ];
    } 
    // Student navigation
    else {
      return [
        ...baseItems,
        { 
          path: '/search', 
          label: 'Browse Institutes', 
          icon: Search, 
          badge: null 
        },
        { 
          path: '/favorites', 
          label: 'Favorites', 
          icon: Heart, 
          badge: '7' 
        },
        { 
          path: '/applications', 
          label: 'Applications', 
          icon: FileCheck, 
          badge: '2' 
        },
        { 
          path: '/courses', 
          label: 'My Courses', 
          icon: GraduationCap, 
          badge: null 
        },
        { 
          path: '/progress', 
          label: 'Learning Progress', 
          icon: Target, 
          badge: null 
        },
      ];
    }
  }, [user]);

  const commonItems = useMemo(() => [
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/help', label: 'Help & Support', icon: HelpCircle },
  ], []);

  const quickActions = useMemo(() => {
    if (user?.type === USER_ROLES.INSTITUTE || user?.role === USER_ROLES.INSTITUTE) {
      const instituteStatus = user.status || user.approvalStatus;
      
      if (instituteStatus === USER_STATUS.APPROVED) {
        return [
          { path: '/institute/courses/new', label: 'Add New Course', icon: BookOpen },
          { path: '/institute/profile/edit', label: 'Update Profile', icon: User },
          { path: '/institute/analytics', label: 'View Analytics', icon: TrendingUp },
        ];
      } else if (instituteStatus === USER_STATUS.PENDING) {
        return [
          { path: '/institute/profile/edit', label: 'Complete Profile', icon: User },
          { path: '/help', label: 'Get Help', icon: HelpCircle },
          { path: '/institute/pending-approval', label: 'Check Approval Status', icon: Clock },
        ];
      } else {
        return [
          { path: '/help', label: 'Contact Support', icon: HelpCircle },
        ];
      }
    } else if (user?.type === USER_ROLES.ADMIN || user?.role === USER_ROLES.ADMIN) {
      return [
        { path: '/admin/approvals', label: 'Review Approvals', icon: FileCheck },
        { path: '/admin/reports', label: 'Generate Reports', icon: BarChart3 },
        { path: '/admin/settings', label: 'System Settings', icon: Settings },
      ];
    } else {
      return [
        { path: '/search', label: 'Find Institutes', icon: Search },
        { path: '/courses', label: 'Browse Courses', icon: BookOpen },
        { path: '/profile/edit', label: 'Complete Profile', icon: User },
      ];
    }
  }, [user]);

  const userStatus = useMemo(() => {
    if (!user) return null;
    
    const userType = user.type || user.role;
    const userStatusValue = user.status || user.approvalStatus;
    
    console.log('🎭 User status calculation:', { userType, userStatusValue, user });
    
    switch (userType) {
      case USER_ROLES.INSTITUTE:
        if (userStatusValue === USER_STATUS.APPROVED) {
          return {
            text: 'Verified Institute',
            color: 'text-green-400',
            bgColor: 'bg-green-500',
            icon: CheckCircle,
            description: 'Your institute is approved and active'
          };
        } else if (userStatusValue === USER_STATUS.PENDING) {
          return {
            text: 'Pending Approval',
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500',
            icon: Clock,
            description: 'Waiting for administrator approval'
          };
        } else if (userStatusValue === USER_STATUS.REJECTED) {
          return {
            text: 'Rejected',
            color: 'text-red-400',
            bgColor: 'bg-red-500',
            icon: AlertTriangle,
            description: 'Your application was rejected'
          };
        } else {
          return {
            text: 'Institute',
            color: 'text-blue-400',
            bgColor: 'bg-blue-500',
            icon: Building,
            description: 'Institute account'
          };
        }
      case USER_ROLES.ADMIN:
        return {
          text: 'Administrator',
          color: 'text-purple-400',
          bgColor: 'bg-purple-500',
          icon: Shield,
          description: 'System administrator'
        };
      default:
        return {
          text: 'Student',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500',
          icon: GraduationCap,
          description: 'Student account'
        };
    }
  }, [user]);

  const currentPage = useMemo(() => 
    navItems.find(item => isActivePath(item.path)) || 
    commonItems.find(item => isActive(item.path)) || 
    { label: 'Dashboard' }
  , [navItems, commonItems, isActivePath, isActive]);

  // Don't show navigation if user is not authenticated
  if (!user) {
    console.log('🚫 Navigation hidden - No user');
    return null;
  }

  // Navigation Item Component for better reusability
  const NavItem = ({ item, isActive, onClick, showBadge = true, className = '' }) => {
    const Icon = item.icon;
    const isDisabled = item.disabled;
    
    return (
      <button
        onClick={() => !isDisabled && onClick(item.path)}
        disabled={isDisabled}
        className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-all duration-200 group ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
            : isDisabled
            ? 'text-gray-500 cursor-not-allowed opacity-50'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        } ${item.special ? 'border border-yellow-500 bg-yellow-500/10' : ''} ${className}`}
        title={isDisabled ? 'Available after approval' : ''}
      >
        <div className="flex items-center">
          <Icon className={`w-5 h-5 mr-3 transition-colors ${
            isActive ? 'text-white' : 
            isDisabled ? 'text-gray-500' : 
            'text-gray-400 group-hover:text-white'
          }`} />
          <span className="font-medium">{item.label}</span>
        </div>
        {showBadge && item.badge && (
          <span className={`px-2 py-1 text-xs rounded-full min-w-6 text-center ${
            isActive 
              ? 'bg-white text-blue-600 font-semibold' 
              : item.special
              ? 'bg-yellow-500 text-white font-semibold animate-pulse'
              : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'
          }`}>
            {item.badge}
          </span>
        )}
        {isDisabled && (
          <span className="text-xs text-gray-500 ml-2">(After Approval)</span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 lg:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Mobile menu button and breadcrumb */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Breadcrumb or page title */}
              <div className="ml-4 lg:ml-0">
                <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                  {currentPage.label}
                  {currentPage.badge && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {currentPage.badge}
                    </span>
                  )}
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Welcome back, {user.name}
                  {userStatus && (
                    <span className={`ml-2 ${userStatus.color} font-medium`}>
                      • {userStatus.text}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Right side - Notifications and Profile */}
            <div className="flex items-center space-x-3">
              {/* Status indicator for pending institutes */}
              {(user?.type === USER_ROLES.INSTITUTE || user?.role === USER_ROLES.INSTITUTE) && 
               (user.status === USER_STATUS.PENDING || user.approvalStatus === USER_STATUS.PENDING) && (
                <div className="hidden sm:flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-yellow-700 text-sm font-medium">Pending Approval</span>
                </div>
              )}

              {/* Notifications */}
              <button 
                onClick={() => handleNavigation('/notifications')}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`${notificationCount} notifications`}
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {/* Profile dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  aria-label="User menu"
                  aria-expanded={profileMenuOpen}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.type || user.role}</p>
                  </div>
                  <ChevronDown 
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      profileMenuOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Profile dropdown menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in-80">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          {userStatus && (
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${userStatus.bgColor} rounded-full border-2 border-white flex items-center justify-center`}>
                              {userStatus.icon && React.isValidElement(userStatus.icon) ? (
                                <userStatus.icon className="w-2 h-2 text-white" />
                              ) : null}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          {userStatus && (
                            <div className="flex items-center mt-1">
                              <span className={`text-xs ${userStatus.color} font-medium`}>
                                {userStatus.text}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick actions */}
                    <div className="py-2">
                      {quickActions.slice(0, 2).map((action, index) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={index}
                            onClick={() => handleNavigation(action.path)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                          >
                            <Icon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-600" />
                            {action.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Main menu items */}
                    <div className="border-t border-gray-100 py-2">
                      {commonItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.path}
                            onClick={() => handleNavigation(item.path)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Icon className="w-4 h-4 mr-3" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-gray-900 to-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 bg-gray-800/50 border-b border-gray-700">
            <Link 
              to="/dashboard"
              className="flex items-center space-x-2 group flex-1"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-lg tracking-tight">EduList</span>
                <p className="text-gray-400 text-xs">Education Platform</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-700 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          <div className="px-4 py-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                {userStatus && (
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${userStatus.bgColor} rounded-full border-2 border-gray-900 flex items-center justify-center`}>
                    {userStatus.icon && React.isValidElement(userStatus.icon) ? (
                      <userStatus.icon className="w-2 h-2 text-white" />
                    ) : null}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user.name}</p>
                <p className="text-gray-400 text-sm capitalize truncate">{user.type || user.role}</p>
                {userStatus && (
                  <p className={`text-xs font-medium mt-1 ${userStatus.color} flex items-center`}>
                    {userStatus.text}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Quick Actions */}
            {quickActions.length > 0 && (
              <div className="px-4 py-4 border-b border-gray-700/50">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-2">
                  Quick Actions
                </p>
                <div className="space-y-2">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleNavigation(action.path)}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-200 group hover:translate-x-1"
                      >
                        <Icon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-white transition-colors" />
                        <span className="text-left">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Main Navigation */}
            <nav className="mt-4 px-4 space-y-1">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-2">
                Main Menu
              </p>
              
              {navItems.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={isActivePath(item.path)}
                  onClick={handleNavigation}
                />
              ))}
            </nav>

            {/* Common Navigation */}
            <nav className="mt-6 px-4 space-y-1">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-2">
                Account
              </p>
              
              {commonItems.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={isActive(item.path)}
                  onClick={handleNavigation}
                  showBadge={false}
                />
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700/50 bg-gray-800/30">
            <div className="flex items-center justify-between text-gray-400 text-sm">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                EduList v1.0
              </span>
              <button 
                onClick={handleLogout}
                className="flex items-center text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-700/50"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;