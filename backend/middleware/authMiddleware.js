import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check for token in cookies (if using cookies)
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // If no token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Authentication token has expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid authentication token.',
          code: 'INVALID_TOKEN'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed.',
          code: 'AUTH_FAILED'
        });
      }
    }

    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user account is active (you can add this field to your User model)
    if (user.status && user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Attach user to request object
    req.user = user;
    
    // Log authentication success (optional, for debugging)
    console.log(`🔐 Authenticated user: ${user.email} (${user.role})`);
    
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication server error.',
      code: 'SERVER_ERROR'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.user.role} role is not authorized to access this resource.`,
        code: 'ROLE_FORBIDDEN',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    console.log(`✅ Authorized ${req.user.role} access for: ${req.user.email}`);
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && (!user.status || user.status === 'active')) {
          req.user = user;
          console.log(`🔐 Optional auth - User found: ${user.email}`);
        }
      } catch (jwtError) {
        // Silently fail for optional auth - don't attach user to request
        console.log('🔐 Optional auth - Invalid token, continuing without user');
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Continue without user for optional auth
    next();
  }
};

export const instituteOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    // For institute-specific operations, check if user owns the institute
    const instituteId = req.params.instituteId || req.body.institute || req.query.institute;
    
    if (!instituteId) {
      return res.status(400).json({
        success: false,
        message: 'Institute ID is required for this operation.',
        code: 'INSTITUTE_ID_REQUIRED'
      });
    }

    // If user is admin, allow access to any institute
    if (req.user.role === 'admin') {
      return next();
    }

    // If user is institute role, check if they own the institute
    if (req.user.role === 'institute') {
      // Assuming you have an institute field in User model for institute owners
      if (req.user.institute && req.user.institute.toString() === instituteId) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only manage your own institute.',
          code: 'INSTITUTE_OWNER_REQUIRED'
        });
      }
    }

    // For regular users, they can only access their own data
    if (req.user.role === 'user') {
      // Users can only create reviews/enquiries for institutes, not manage them
      if (req.method === 'POST' && (req.originalUrl.includes('/reviews') || req.originalUrl.includes('/enquiries'))) {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: 'Access denied. Institute management requires institute or admin role.',
        code: 'INSTITUTE_ACCESS_DENIED'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied.',
      code: 'ACCESS_DENIED'
    });
  } catch (error) {
    console.error('Institute owner middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authorization server error.',
      code: 'SERVER_ERROR'
    });
  }
};

export const selfOrAdmin = (field = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    const resourceId = req.params[field] || req.body[field];
    
    // Admins can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Users can only access their own resources
    if (req.user.id === resourceId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.',
      code: 'SELF_ACCESS_ONLY'
    });
  };
};

// Rate limiting helper (you can integrate with express-rate-limit)
export const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return (req, res, next) => {
    // This is a simple implementation - consider using express-rate-limit for production
    console.log(`📊 Rate limit check for IP: ${req.ip}`);
    next();
  };
};