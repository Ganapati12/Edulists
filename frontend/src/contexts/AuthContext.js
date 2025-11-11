// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { database } from '../services/database';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Initialize auth from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedUser = localStorage.getItem('edulist_current_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        localStorage.removeItem('edulist_current_user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Dynamic login function
  const login = useCallback(async (email, password, userType = 'user') => {
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Login attempt:', { email, userType });

      // Authenticate against database
      const authenticatedUser = database.authenticate(email, password);
      
      if (!authenticatedUser) {
        setError('Invalid email or password');
        return { success: false, message: 'Invalid email or password' };
      }

      // Check user type match
      if (userType === 'institute' && authenticatedUser.role !== 'institute') {
        setError('Please use institute login for institute accounts');
        return { success: false, message: 'Please use institute login for institute accounts' };
      }

      if (userType === 'user' && authenticatedUser.role !== 'user') {
        setError('Please use user login for student accounts');
        return { success: false, message: 'Please use user login for student accounts' };
      }

      if (userType === 'admin' && authenticatedUser.role !== 'admin') {
        setError('Admin access required');
        return { success: false, message: 'Admin access required' };
      }

      // Check approval status for non-admin users
      if (authenticatedUser.role !== 'admin') {
        if (authenticatedUser.status === 'pending') {
          setError('Your account is pending approval. Please wait for administrator approval.');
          return { 
            success: false, 
            message: 'Your account is pending approval. Please wait for administrator approval.',
            requiresApproval: true 
          };
        } else if (authenticatedUser.status === 'rejected') {
          setError('Your account has been rejected. Please contact support.');
          return { 
            success: false, 
            message: 'Your account has been rejected. Please contact support.' 
          };
        }
      }

      // Set user data
      const userData = {
        ...authenticatedUser,
        lastLogin: new Date().toISOString()
      };

      // Save to localStorage
      localStorage.setItem('edulist_current_user', JSON.stringify(userData));
      setUser(userData);

      console.log('✅ Login successful:', userData);
      return { success: true, user: userData };

    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      return { success: false, message: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Dynamic registration function
  const register = useCallback(async (userData, userType = 'user') => {
    setLoading(true);
    setError('');

    try {
      console.log('📝 Registration attempt:', { userType, email: userData.email });

      // Check if email already exists
      const existingUser = database.findUserByEmail(userData.email);
      if (existingUser) {
        setError('Email already registered');
        return { success: false, message: 'Email already registered' };
      }

      let newUser;
      if (userType === 'institute') {
        newUser = database.createInstitute(userData);
      } else {
        newUser = database.createUser(userData);
      }

      console.log('✅ Registration successful:', newUser);

      // Don't auto-login after registration
      return { 
        success: true, 
        message: 'Registration successful! Please wait for admin approval.',
        user: newUser 
      };

    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
      return { success: false, message: 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('edulist_current_user');
    setUser(null);
    setError('');
  }, []);

  // Check approval status
  const checkApprovalStatus = useCallback(async () => {
    if (!user) return false;

    try {
      let currentData;
      if (user.role === 'user') {
        currentData = database.getUserById(user.id);
      } else if (user.role === 'institute') {
        currentData = database.getInstituteById(user.id);
      }

      if (currentData && currentData.status === 'approved') {
        // Update local user data
        const updatedUser = { ...user, status: 'approved' };
        localStorage.setItem('edulist_current_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error checking approval status:', err);
      return false;
    }
  }, [user]);

  // Update profile
  const updateProfile = useCallback(async (updates) => {
    if (!user) {
      setError('No user logged in');
      return { success: false, message: 'No user logged in' };
    }

    try {
      // Update in database based on user role
      let updatedUser;
      if (user.role === 'user') {
        const userData = database.getUserById(user.id);
        updatedUser = { ...userData, ...updates };
        // In a real implementation, you'd have an update method in database
      } else if (user.role === 'institute') {
        const instituteData = database.getInstituteById(user.id);
        updatedUser = { ...instituteData, ...updates };
      }

      // Update local state
      const finalUser = { ...user, ...updates };
      localStorage.setItem('edulist_current_user', JSON.stringify(finalUser));
      setUser(finalUser);

      return { success: true, user: finalUser };
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile');
      return { success: false, message: 'Failed to update profile' };
    }
  }, [user]);

  // Admin functions
  const approveUser = useCallback((userId) => {
    try {
      const updatedUser = database.updateUserStatus(userId, 'approved');
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error('Error approving user:', err);
      return { success: false, error: 'Failed to approve user' };
    }
  }, []);

  const approveInstitute = useCallback((instituteId) => {
    try {
      const updatedInstitute = database.updateInstituteStatus(instituteId, 'approved');
      return { success: true, institute: updatedInstitute };
    } catch (err) {
      console.error('Error approving institute:', err);
      return { success: false, error: 'Failed to approve institute' };
    }
  }, []);

  const rejectUser = useCallback((userId, reason) => {
    try {
      const updatedUser = database.updateUserStatus(userId, 'rejected');
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error('Error rejecting user:', err);
      return { success: false, error: 'Failed to reject user' };
    }
  }, []);

  const rejectInstitute = useCallback((instituteId, reason) => {
    try {
      const updatedInstitute = database.updateInstituteStatus(instituteId, 'rejected');
      return { success: true, institute: updatedInstitute };
    } catch (err) {
      console.error('Error rejecting institute:', err);
      return { success: false, error: 'Failed to reject institute' };
    }
  }, []);

  // Data retrieval functions
  const getPendingUsers = useCallback(() => {
    return database.getPendingUsers();
  }, []);

  const getPendingInstitutes = useCallback(() => {
    return database.getPendingInstitutes();
  }, []);

  const getApprovedInstitutes = useCallback(() => {
    return database.getApprovedInstitutes();
  }, []);

  const getDashboardStats = useCallback(() => {
    return database.getDashboardStats();
  }, []);

  // Utility functions
  const isAuthenticated = useCallback(() => !!user, [user]);
  const isAdmin = useCallback(() => user?.role === 'admin', [user]);
  const isInstitute = useCallback(() => user?.role === 'institute', [user]);
  const isUser = useCallback(() => user?.role === 'user', [user]);
  const isApproved = useCallback(() => user?.status === 'approved', [user]);

  const value = {
    // State
    user,
    loading,
    error,
    
    // Auth functions
    login,
    logout,
    register,
    checkApprovalStatus,
    updateProfile,
    
    // Admin functions
    approveUser,
    approveInstitute,
    rejectUser,
    rejectInstitute,
    getPendingUsers,
    getPendingInstitutes,
    
    // Data functions
    getApprovedInstitutes,
    getDashboardStats,
    
    // Utility functions
    isAuthenticated,
    isAdmin,
    isInstitute,
    isUser,
    isApproved,
    
    // Error handling
    setError,
    clearError: () => setError('')
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;