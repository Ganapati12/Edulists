// components/ProtectedRoute.js - UPDATED & IMPROVED VERSION
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Enhanced ProtectedRoute component with comprehensive authentication and authorization
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - The component to render if access is granted
 * @param {string[]} props.allowedRoles - Array of allowed roles (['admin'], ['institute'], ['user'], or any combination)
 * @param {boolean} props.requireApproval - Whether to require institute approval (default: true)
 * @param {string} props.redirectTo - Custom redirect path for unauthorized access
 * @param {string} props.loadingMessage - Custom loading message
 * @param {boolean} props.redirectAuthenticated - Whether to redirect already authenticated users (for public routes)
 * @param {Function} props.customValidation - Additional custom validation function
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireApproval = true,
  redirectTo = null,
  loadingMessage = 'Loading...',
  redirectAuthenticated = false,
  customValidation = null
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Loading state with improved UX
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // Handle public routes (redirect authenticated users away from login/register pages)
  if (redirectAuthenticated && isAuthenticated && user) {
    return getAuthenticatedRedirect(user, location);
  }

  // Handle protected routes
  if (!redirectAuthenticated) {
    const accessCheck = checkAccess(user, isAuthenticated, allowedRoles, requireApproval, location, customValidation);
    
    if (!accessCheck.granted) {
      console.warn(`Access denied: ${accessCheck.reason}`);
      return <Navigate to={redirectTo || accessCheck.redirectTo} replace state={{ from: location }} />;
    }
  }

  // All checks passed - render the component
  console.log(`Access granted for ${user?.role} to ${location.pathname}`);
  return children;
};

/**
 * Comprehensive access control check
 */
const checkAccess = (user, isAuthenticated, allowedRoles, requireApproval, location, customValidation) => {
  // Check authentication
  if (!isAuthenticated || !user) {
    return {
      granted: false,
      reason: 'User not authenticated',
      redirectTo: getUnauthenticatedRedirectPath(allowedRoles, location)
    };
  }

  // Check custom validation if provided
  if (customValidation && !customValidation(user)) {
    return {
      granted: false,
      reason: 'Custom validation failed',
      redirectTo: '/unauthorized'
    };
  }

  // Role-based access control
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      granted: false,
      reason: `User role ${user.role} not in allowed roles: ${allowedRoles.join(', ')}`,
      redirectTo: '/unauthorized'
    };
  }

  // Institute-specific checks
  if (user.role === 'institute') {
    const instituteCheck = checkInstituteAccess(user, requireApproval, location.pathname);
    if (!instituteCheck.granted) {
      return instituteCheck;
    }
  }

  // Route-based protection (additional security layer)
  const routeAccessCheck = checkRouteAccess(user.role, location.pathname);
  if (!routeAccessCheck.allowed) {
    return {
      granted: false,
      reason: `Route access denied for ${user.role} to ${location.pathname}`,
      redirectTo: routeAccessCheck.redirectTo || '/unauthorized'
    };
  }

  return { granted: true };
};

/**
 * Institute-specific access checks
 */
const checkInstituteAccess = (user, requireApproval, currentPath) => {
  // Check if institute is approved
  if (requireApproval && user.status !== 'approved') {
    const redirectPath = getInstituteRedirectPath(user.status, currentPath);
    return {
      granted: false,
      reason: `Institute status is ${user.status}, required: approved`,
      redirectTo: redirectPath
    };
  }

  // Additional institute-specific checks can be added here
  if (user.role === 'institute' && currentPath.includes('/admin')) {
    return {
      granted: false,
      reason: 'Institute cannot access admin routes',
      redirectTo: '/institute/dashboard'
    };
  }

  return { granted: true };
};

/**
 * Get redirect path for unauthenticated users based on attempted route
 */
const getUnauthenticatedRedirectPath = (allowedRoles, location) => {
  const from = location.pathname + location.search;
  
  // Determine login page based on allowed roles or current route
  let loginPath = '/login';
  
  if (allowedRoles.length > 0) {
    if (allowedRoles.includes('admin')) {
      loginPath = '/admin/login';
    } else if (allowedRoles.includes('institute')) {
      loginPath = '/institute/login';
    } else if (allowedRoles.includes('user')) {
      loginPath = '/login';
    }
  } else {
    // Fallback based on current route
    if (location.pathname.startsWith('/admin')) {
      loginPath = '/admin/login';
    } else if (location.pathname.startsWith('/institute')) {
      loginPath = '/institute/login';
    }
  }
  
  return `${loginPath}?from=${encodeURIComponent(from)}`;
};

/**
 * Get redirect path for institute based on status
 */
const getInstituteRedirectPath = (status, currentPath) => {
  switch (status) {
    case 'pending':
      return '/institute/pending-approval';
    case 'rejected':
      return '/institute/application-rejected';
    case 'suspended':
      return '/institute/account-suspended';
    default:
      return '/institute/dashboard';
  }
};

/**
 * Get redirect for already authenticated users (for public routes)
 */
const getAuthenticatedRedirect = (user, location) => {
  const from = location.state?.from || '/';
  let redirectPath = '/dashboard';
  
  switch (user.role) {
    case 'admin':
      redirectPath = '/admin/dashboard';
      break;
    case 'institute':
      redirectPath = getInstituteRedirectPath(user.status, location.pathname);
      break;
    case 'user':
      redirectPath = '/dashboard';
      break;
    default:
      redirectPath = '/';
  }
  
  console.log(`User already authenticated, redirecting to: ${redirectPath}`);
  return <Navigate to={redirectPath} replace />;
};

/**
 * Check if user has access to the current route based on their role
 */
const checkRouteAccess = (userRole, currentPath) => {
  // Define route patterns and required roles
  const routeRules = [
    { 
      pattern: /^\/admin/, 
      allowedRoles: ['admin'],
      description: 'Admin routes'
    },
    { 
      pattern: /^\/institute/, 
      allowedRoles: ['institute'],
      description: 'Institute routes'
    },
    { 
      pattern: /^\/user\/profile/, 
      allowedRoles: ['user', 'admin'],
      description: 'User profile routes'
    },
    { 
      pattern: /^\/dashboard/, 
      allowedRoles: ['user', 'institute', 'admin'],
      description: 'Dashboard routes'
    },
  ];

  // Find matching route rule
  const matchingRule = routeRules.find(rule => rule.pattern.test(currentPath));
  
  if (matchingRule && !matchingRule.allowedRoles.includes(userRole)) {
    // Determine appropriate redirect based on user role
    let redirectTo = '/unauthorized';
    switch (userRole) {
      case 'admin':
        redirectTo = '/admin/dashboard';
        break;
      case 'institute':
        redirectTo = '/institute/dashboard';
        break;
      case 'user':
        redirectTo = '/dashboard';
        break;
    }
    
    return { allowed: false, redirectTo };
  }
  
  return { allowed: true };
};

/**
 * Convenience wrapper for admin-only routes
 */
export const AdminProtectedRoute = ({ children, ...props }) => (
  <ProtectedRoute 
    allowedRoles={['admin']} 
    loadingMessage="Loading admin access..."
    {...props}
  >
    {children}
  </ProtectedRoute>
);

/**
 * Convenience wrapper for institute-only routes
 */
export const InstituteProtectedRoute = ({ 
  children, 
  requireApproval = true, 
  ...props 
}) => (
  <ProtectedRoute 
    allowedRoles={['institute']} 
    requireApproval={requireApproval}
    loadingMessage="Loading institute access..."
    {...props}
  >
    {children}
  </ProtectedRoute>
);

/**
 * Convenience wrapper for user-only routes
 */
export const UserProtectedRoute = ({ children, ...props }) => (
  <ProtectedRoute 
    allowedRoles={['user']} 
    loadingMessage="Loading user access..."
    {...props}
  >
    {children}
  </ProtectedRoute>
);

/**
 * Convenience wrapper for mixed role routes
 */
export const MultiRoleProtectedRoute = ({ roles, children, ...props }) => (
  <ProtectedRoute 
    allowedRoles={roles} 
    loadingMessage="Loading..."
    {...props}
  >
    {children}
  </ProtectedRoute>
);

/**
 * Convenience wrapper for public routes that should redirect authenticated users
 */
export const PublicRoute = ({ children, ...props }) => (
  <ProtectedRoute 
    redirectAuthenticated={true}
    {...props}
  >
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;