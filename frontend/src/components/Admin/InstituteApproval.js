// contexts/InstituteAuthContext.js - COMPLETE FIXED VERSION
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const InstituteAuthContext = createContext();

export function InstituteAuthProvider({ children }) {
  const [instituteUser, setInstituteUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  const initializeAuth = useCallback(() => {
    try {
      setLoading(true);
      console.log('🔍 Initializing institute auth from storage...');
      
      // Check all possible storage locations
      const storageLocations = [
        'institute_user', 
        'currentUser', 
        'user',
        'instituteUser',
        'instituteUserData'
      ];
      
      let foundUser = null;

      for (const location of storageLocations) {
        const stored = localStorage.getItem(location);
        if (stored) {
          try {
            const userData = JSON.parse(stored);
            console.log(`📁 Checking ${location}:`, userData);
            
            // Check if this is an institute user with proper structure
            if (userData && (
              userData.type === 'institute' || 
              userData.role === 'institute' || 
              (userData.email && userData.email.includes('@')) ||
              userData.status ||
              userData.instituteName
            )) {
              foundUser = userData;
              console.log(`✅ Found institute user in ${location}`);
              
              // Ensure the user has all required fields
              if (!foundUser.status) {
                foundUser.status = 'pending';
              }
              
              break;
            }
          } catch (parseError) {
            console.error(`Error parsing ${location}:`, parseError);
          }
        }
      }

      setInstituteUser(foundUser);
      console.log('✅ Institute auth initialized:', foundUser);

    } catch (err) {
      console.error('Error initializing institute auth:', err);
      setInstituteUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // FIXED REGISTER FUNCTION - Proper data storage for admin approval
  const register = useCallback(async (instituteData) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('📝 Institute registration attempt:', { 
        email: instituteData?.email,
        name: instituteData?.name 
      });

      // Validate input data with proper null checking
      if (!instituteData || !instituteData.email || !instituteData.name) {
        const errorMsg = 'Invalid registration data. Please provide all required fields.';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }

      // Get existing institutes with proper null safety
      let existingInstitutes = [];
      try {
        const storedInstitutes = localStorage.getItem('institutes');
        if (storedInstitutes) {
          existingInstitutes = JSON.parse(storedInstitutes);
          // Ensure it's an array
          if (!Array.isArray(existingInstitutes)) {
            console.warn('⚠️ Institutes data was not an array, resetting...');
            existingInstitutes = [];
          }
        }
      } catch (parseError) {
        console.error('Error parsing existing institutes:', parseError);
        existingInstitutes = [];
      }

      // Check if email already exists with proper null checking
      if (existingInstitutes && Array.isArray(existingInstitutes)) {
        const existingInstitute = existingInstitutes.find(inst => 
          inst && inst.email && inst.email === instituteData.email
        );
        
        if (existingInstitute) {
          const errorMsg = 'An institute with this email already exists.';
          setError(errorMsg);
          return { success: false, message: errorMsg };
        }
      }

      // Create new institute with comprehensive data - STATUS SET TO PENDING
      const newInstitute = {
        id: `inst_${Date.now()}`,
        ...instituteData,
        type: 'institute',
        role: 'institute',
        status: 'pending', // Start as pending
        createdAt: new Date().toISOString(),
        approvedAt: null,
        loginCount: 0,
        lastLogin: null,
        permissions: [], // No permissions until approved
        adminReviewDate: null,
        rejectionReason: null,
        // Additional fields for admin panel
        registrationDate: new Date().toISOString(),
        documentsVerified: false,
        contactVerified: false,
        adminNotes: ''
      };

      // Ensure all required fields are present
      if (!newInstitute.contactPerson) {
        newInstitute.contactPerson = instituteData.name;
      }
      if (!newInstitute.contactEmail) {
        newInstitute.contactEmail = instituteData.email;
      }
      if (!newInstitute.contactPhone) {
        newInstitute.contactPhone = instituteData.phone || 'Not provided';
      }

      // CRITICAL: Save to localStorage in multiple locations for different components to access
      try {
        // 1. Save to institutes array (for admin panel)
        const updatedInstitutes = [...existingInstitutes, newInstitute];
        localStorage.setItem('institutes', JSON.stringify(updatedInstitutes));
        console.log('✅ Institutes saved to localStorage:', updatedInstitutes.length);

        // 2. Save to institute_users array (for login authentication)
        const existingInstituteUsers = JSON.parse(localStorage.getItem('institute_users') || '[]');
        const instituteUserData = {
          id: newInstitute.id,
          email: newInstitute.email,
          password: newInstitute.password,
          role: 'institute',
          instituteId: newInstitute.id,
          status: 'pending',
          createdAt: new Date().toISOString(),
          name: newInstitute.name,
          contactPerson: newInstitute.contactPerson,
          phone: newInstitute.phone
        };
        const updatedInstituteUsers = [...existingInstituteUsers, instituteUserData];
        localStorage.setItem('institute_users', JSON.stringify(updatedInstituteUsers));
        console.log('✅ Institute users saved to localStorage:', updatedInstituteUsers.length);

        // 3. Save to users array (for general user management)
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const userData = {
          id: newInstitute.id,
          email: newInstitute.email,
          password: newInstitute.password,
          role: 'institute',
          instituteId: newInstitute.id,
          status: 'pending',
          createdAt: new Date().toISOString(),
          name: newInstitute.name
        };
        const updatedUsers = [...existingUsers, userData];
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        console.log('✅ Users saved to localStorage:', updatedUsers.length);

        // 4. Save to pending approvals for admin dashboard
        const pendingApprovals = JSON.parse(localStorage.getItem('pendingApprovals') || '[]');
        const approvalData = {
          id: newInstitute.id,
          type: 'institute',
          name: newInstitute.name,
          email: newInstitute.email,
          contactPerson: newInstitute.contactPerson,
          contactEmail: newInstitute.contactEmail,
          contactPhone: newInstitute.contactPhone,
          instituteType: newInstitute.instituteType,
          establishedYear: newInstitute.establishedYear,
          address: newInstitute.address,
          registrationDate: new Date().toISOString(),
          status: 'pending'
        };
        const updatedPendingApprovals = [...pendingApprovals, approvalData];
        localStorage.setItem('pendingApprovals', JSON.stringify(updatedPendingApprovals));
        console.log('✅ Pending approvals saved:', updatedPendingApprovals.length);

      } catch (storageError) {
        console.error('Error saving to localStorage:', storageError);
        throw new Error('Failed to save registration data');
      }

      // Store registration time for tracking
      localStorage.setItem(`institute_registration_${newInstitute.id}`, new Date().getTime().toString());

      console.log('✅ Institute registration successful:', newInstitute);

      // IMPORTANT: DO NOT auto-login or set instituteUser
      // Let the user log in manually after admin approval

      // Return success - component will handle navigation to login
      return { 
        success: true, 
        user: newInstitute,
        message: 'Registration successful! Please wait for admin approval. You will be notified via email.'
      };

    } catch (err) {
      console.error('Institute registration error:', err);
      const errorMsg = err.message || 'Registration failed. Please try again.';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ENHANCED LOGIN FUNCTION - Checks approval status from database
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔐 Institute login attempt:', email);

      // First, check in the institute_users database (primary location)
      const instituteUsers = JSON.parse(localStorage.getItem('institute_users') || '[]');
      const institutes = JSON.parse(localStorage.getItem('institutes') || '[]');
      
      // Find user in institute_users database
      const user = instituteUsers.find(u => 
        u && u.email === email && u.password === password && u.role === 'institute'
      );

      if (!user) {
        setError('Invalid email or password.');
        return false;
      }

      // Find corresponding institute data
      const institute = institutes.find(inst => 
        inst && inst.id === user.instituteId
      );

      if (!institute) {
        setError('Institute data not found. Please contact support.');
        return false;
      }

      console.log('📊 Institute status:', institute.status);

      // Create comprehensive user object with current status
      const userData = {
        ...user,
        ...institute,
        lastLogin: new Date().toISOString(),
        loginCount: (user.loginCount || 0) + 1
      };

      // Update login count in institute_users database
      const updatedInstituteUsers = instituteUsers.map(u => 
        u.id === user.id ? { ...u, lastLogin: userData.lastLogin, loginCount: userData.loginCount } : u
      );
      localStorage.setItem('institute_users', JSON.stringify(updatedInstituteUsers));

      // Store user data for session
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('institute_user', JSON.stringify(userData));
      localStorage.setItem('instituteUser', JSON.stringify(userData));
      
      setInstituteUser(userData);

      console.log('✅ Institute login successful. Status:', userData.status);

      // Navigate based on current approval status
      setTimeout(() => {
        if (userData.status === 'approved') {
          console.log('🔄 Redirecting to approved dashboard');
          navigate('/institute/dashboard', { replace: true });
        } else if (userData.status === 'pending') {
          console.log('🔄 Redirecting to pending approval page');
          navigate('/institute/pending-approval', { replace: true });
        } else if (userData.status === 'rejected') {
          console.log('🔄 Redirecting to rejected page');
          navigate('/institute/rejected', { 
            replace: true,
            state: { rejectionReason: userData.rejectionReason }
          });
        }
      }, 100);
      
      return true;

    } catch (err) {
      console.error('Institute login error:', err);
      setError('Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ADMIN FUNCTIONS - For admin panel to manage approvals
  const approveInstitute = useCallback((instituteId, adminNotes = '') => {
    try {
      console.log(`🔄 Approving institute: ${instituteId}`);
      
      // Update all storage locations
      const institutes = JSON.parse(localStorage.getItem('institutes') || '[]');
      const instituteUsers = JSON.parse(localStorage.getItem('institute_users') || '[]');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const pendingApprovals = JSON.parse(localStorage.getItem('pendingApprovals') || '[]');
      
      // Update institute status
      const updatedInstitutes = institutes.map(inst => 
        inst.id === instituteId 
          ? { 
              ...inst, 
              status: 'approved',
              approvedAt: new Date().toISOString(),
              adminReviewDate: new Date().toISOString(),
              permissions: ['manage_courses', 'view_enquiries', 'manage_reviews'],
              adminNotes: adminNotes || 'Approved by administrator',
              updatedAt: new Date().toISOString()
            } 
          : inst
      );

      // Update institute user status
      const updatedInstituteUsers = instituteUsers.map(user =>
        user.instituteId === instituteId || user.id === instituteId
          ? { 
              ...user, 
              status: 'approved',
              approvedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : user
      );

      // Update general users status
      const updatedUsers = users.map(user =>
        user.instituteId === instituteId || user.id === instituteId
          ? { ...user, status: 'approved' }
          : user
      );

      // Remove from pending approvals
      const updatedPendingApprovals = pendingApprovals.filter(approval => 
        approval.id !== instituteId
      );

      // Save all updates
      localStorage.setItem('institutes', JSON.stringify(updatedInstitutes));
      localStorage.setItem('institute_users', JSON.stringify(updatedInstituteUsers));
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.setItem('pendingApprovals', JSON.stringify(updatedPendingApprovals));

      console.log(`✅ Institute ${instituteId} approved successfully`);
      
      // Update current user if they are logged in
      if (instituteUser && instituteUser.id === instituteId) {
        const updatedUser = { ...instituteUser, status: 'approved' };
        setInstituteUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        localStorage.setItem('institute_user', JSON.stringify(updatedUser));
        localStorage.setItem('instituteUser', JSON.stringify(updatedUser));
      }

      return { success: true, message: 'Institute approved successfully' };

    } catch (error) {
      console.error('Error approving institute:', error);
      return { success: false, error: error.message };
    }
  }, [instituteUser]);

  const rejectInstitute = useCallback((instituteId, rejectionReason, adminNotes = '') => {
    try {
      console.log(`🔄 Rejecting institute: ${instituteId}`);
      
      const institutes = JSON.parse(localStorage.getItem('institutes') || '[]');
      const instituteUsers = JSON.parse(localStorage.getItem('institute_users') || '[]');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const pendingApprovals = JSON.parse(localStorage.getItem('pendingApprovals') || '[]');
      
      const updatedInstitutes = institutes.map(inst => 
        inst.id === instituteId 
          ? { 
              ...inst, 
              status: 'rejected',
              rejectionReason,
              adminReviewDate: new Date().toISOString(),
              adminNotes: adminNotes || 'Rejected by administrator',
              updatedAt: new Date().toISOString()
            } 
          : inst
      );

      const updatedInstituteUsers = instituteUsers.map(user =>
        user.instituteId === instituteId || user.id === instituteId
          ? { 
              ...user, 
              status: 'rejected',
              rejectionReason,
              updatedAt: new Date().toISOString()
            }
          : user
      );

      const updatedUsers = users.map(user =>
        user.instituteId === instituteId || user.id === instituteId
          ? { ...user, status: 'rejected' }
          : user
      );

      // Remove from pending approvals
      const updatedPendingApprovals = pendingApprovals.filter(approval => 
        approval.id !== instituteId
      );

      localStorage.setItem('institutes', JSON.stringify(updatedInstitutes));
      localStorage.setItem('institute_users', JSON.stringify(updatedInstituteUsers));
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.setItem('pendingApprovals', JSON.stringify(updatedPendingApprovals));

      console.log(`❌ Institute ${instituteId} rejected:`, rejectionReason);
      
      // Update current user if they are logged in
      if (instituteUser && instituteUser.id === instituteId) {
        const updatedUser = { ...instituteUser, status: 'rejected', rejectionReason };
        setInstituteUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        localStorage.setItem('institute_user', JSON.stringify(updatedUser));
        localStorage.setItem('instituteUser', JSON.stringify(updatedUser));
      }

      return { success: true, message: 'Institute rejected successfully' };

    } catch (error) {
      console.error('Error rejecting institute:', error);
      return { success: false, error: error.message };
    }
  }, [instituteUser]);

  // Get all pending institutes for admin
  const getPendingInstitutes = useCallback(() => {
    try {
      const institutes = JSON.parse(localStorage.getItem('institutes') || '[]');
      const pendingInstitutes = institutes.filter(inst => inst.status === 'pending');
      console.log(`📋 Found ${pendingInstitutes.length} pending institutes`);
      return pendingInstitutes;
    } catch (error) {
      console.error('Error getting pending institutes:', error);
      return [];
    }
  }, []);

  // Get all institutes for admin (approved, pending, rejected)
  const getAllInstitutes = useCallback(() => {
    try {
      const institutes = JSON.parse(localStorage.getItem('institutes') || '[]');
      console.log(`📋 Total institutes: ${institutes.length}`);
      return institutes;
    } catch (error) {
      console.error('Error getting all institutes:', error);
      return [];
    }
  }, []);

  // Get institute by ID for admin
  const getInstituteById = useCallback((instituteId) => {
    try {
      const institutes = JSON.parse(localStorage.getItem('institutes') || '[]');
      return institutes.find(inst => inst.id === instituteId);
    } catch (error) {
      console.error('Error getting institute by ID:', error);
      return null;
    }
  }, []);

  // Get approval statistics for admin dashboard
  const getApprovalStats = useCallback(() => {
    try {
      const institutes = JSON.parse(localStorage.getItem('institutes') || '[]');
      const stats = {
        total: institutes.length,
        approved: institutes.filter(inst => inst.status === 'approved').length,
        pending: institutes.filter(inst => inst.status === 'pending').length,
        rejected: institutes.filter(inst => inst.status === 'rejected').length
      };
      console.log('📊 Approval stats:', stats);
      return stats;
    } catch (error) {
      console.error('Error getting approval stats:', error);
      return { total: 0, approved: 0, pending: 0, rejected: 0 };
    }
  }, []);

  // Enhanced login function that returns object (for backward compatibility)
  const loginWithResponse = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔐 Institute login attempt with response:', email);

      // Use the same logic as login function but return object
      const instituteUsers = JSON.parse(localStorage.getItem('institute_users') || '[]');
      const institutes = JSON.parse(localStorage.getItem('institutes') || '[]');
      
      const user = instituteUsers.find(u => 
        u && u.email === email && u.password === password && u.role === 'institute'
      );

      if (!user) {
        const errorMsg = 'Invalid email or password.';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }

      const institute = institutes.find(inst => 
        inst && inst.id === user.instituteId
      );

      if (!institute) {
        const errorMsg = 'Institute data not found. Please contact support.';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }

      const userData = {
        ...user,
        ...institute,
        lastLogin: new Date().toISOString(),
        loginCount: (user.loginCount || 0) + 1
      };

      // Update login count
      const updatedInstituteUsers = instituteUsers.map(u => 
        u.id === user.id ? { ...u, lastLogin: userData.lastLogin, loginCount: userData.loginCount } : u
      );
      localStorage.setItem('institute_users', JSON.stringify(updatedInstituteUsers));

      // Store session data
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('institute_user', JSON.stringify(userData));
      localStorage.setItem('instituteUser', JSON.stringify(userData));
      
      setInstituteUser(userData);

      console.log('✅ Institute login successful. Status:', userData.status);

      // Navigate based on status
      setTimeout(() => {
        if (userData.status === 'approved') {
          navigate('/institute/dashboard', { replace: true });
        } else if (userData.status === 'pending') {
          navigate('/institute/pending-approval', { replace: true });
        } else if (userData.status === 'rejected') {
          navigate('/institute/rejected', { 
            replace: true,
            state: { rejectionReason: userData.rejectionReason }
          });
        }
      }, 100);
      
      return { 
        success: true, 
        user: userData,
        status: userData.status
      };

    } catch (err) {
      console.error('Institute login error:', err);
      const errorMsg = 'Login failed. Please try again.';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Enhanced logout function
  const logout = useCallback(() => {
    console.log('🚪 Institute logout');
    
    // Clear all possible storage locations
    const storageKeys = [
      'currentUser',
      'institute_user', 
      'user',
      'instituteUser',
      'instituteUserData',
      'instituteToken'
    ];
    
    storageKeys.forEach(key => localStorage.removeItem(key));
    
    setInstituteUser(null);
    setError('');
    
    // Navigate to login page
    navigate('/institute/login', { replace: true });
  }, [navigate]);

  // Update profile function
  const updateProfile = useCallback(async (updatedData) => {
    try {
      if (!instituteUser) {
        setError('No user logged in');
        return { success: false, message: 'No user logged in' };
      }

      const updatedUser = {
        ...instituteUser,
        ...updatedData,
        updatedAt: new Date().toISOString()
      };

      // Update all storage locations
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      localStorage.setItem('institute_user', JSON.stringify(updatedUser));
      localStorage.setItem('instituteUser', JSON.stringify(updatedUser));
      
      setInstituteUser(updatedUser);

      console.log('✅ Profile updated:', updatedUser);
      return { success: true, user: updatedUser };

    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile');
      return { success: false, message: 'Failed to update profile' };
    }
  }, [instituteUser]);

  // Check approval status - Now checks from database
  const checkApprovalStatus = useCallback(async () => {
    try {
      console.log('🔍 Checking approval status from database...');
      
      if (!instituteUser) {
        console.log('No user found for approval check');
        return false;
      }

      // Get fresh data from database
      const institutes = JSON.parse(localStorage.getItem('institutes') || '[]');
      const currentInstitute = institutes.find(inst => inst.id === instituteUser.id);
      
      if (!currentInstitute) {
        console.log('Institute not found in database');
        return false;
      }

      console.log(`📊 Current status from database: ${currentInstitute.status}`);
      
      // Update local state if status changed
      if (currentInstitute.status !== instituteUser.status) {
        console.log('🔄 Status changed, updating user data...');
        const updatedUser = { ...instituteUser, status: currentInstitute.status };
        
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        localStorage.setItem('institute_user', JSON.stringify(updatedUser));
        localStorage.setItem('instituteUser', JSON.stringify(updatedUser));
        
        setInstituteUser(updatedUser);
      }

      return currentInstitute.status === 'approved';
      
    } catch (error) {
      console.error('Error checking approval status:', error);
      return false;
    }
  }, [instituteUser]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    const isAuth = !!instituteUser;
    console.log(`🔐 Authentication check: ${isAuth}`);
    return isAuth;
  }, [instituteUser]);

  // Check if institute is approved
  const isApproved = useCallback(() => {
    const approved = instituteUser?.status === 'approved';
    console.log(`✅ Approval check: ${approved}`, instituteUser);
    return approved;
  }, [instituteUser]);

  // Check if institute is pending
  const isPending = useCallback(() => {
    return instituteUser?.status === 'pending';
  }, [instituteUser]);

  // Check if institute is rejected
  const isRejected = useCallback(() => {
    return instituteUser?.status === 'rejected';
  }, [instituteUser]);

  // Get user status
  const getUserStatus = useCallback(() => {
    return instituteUser?.status || 'unknown';
  }, [instituteUser]);

  // Clear error
  const clearError = useCallback(() => setError(''), []);

  // Refresh user data from database
  const refreshUser = useCallback(() => {
    console.log('🔄 Refreshing user data from database...');
    initializeAuth();
  }, [initializeAuth]);

  // Get demo institutes for quick login
  const getDemoInstitutes = useCallback(() => {
    return [
      {
        email: 'admin@institute.com',
        password: 'anypassword',
        name: 'Demo Approved Institute',
        status: 'approved',
        description: 'Use this for immediate dashboard access'
      },
      {
        email: 'pending@institute.com',
        password: 'anypassword',
        name: 'Demo Pending Institute',
        status: 'pending',
        description: 'Use this to test pending approval flow'
      },
      {
        email: 'rejected@institute.com',
        password: 'anypassword',
        name: 'Demo Rejected Institute',
        status: 'rejected',
        description: 'Use this to test rejection flow'
      }
    ];
  }, []);

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    if (instituteUser && !loading) {
      const currentPath = window.location.pathname;
      console.log(`🔄 Auto-redirect check: ${currentPath}, Status: ${instituteUser.status}`);
      
      // Don't redirect if already on appropriate page
      const shouldRedirect = 
        (currentPath === '/institute/login' || 
         currentPath === '/institute/register' ||
         (currentPath === '/institute/pending-approval' && instituteUser.status === 'approved') ||
         (currentPath === '/institute/dashboard' && instituteUser.status !== 'approved'));
      
      if (shouldRedirect) {
        setTimeout(() => {
          if (instituteUser.status === 'approved') {
            console.log('🔄 Auto-redirecting to dashboard');
            navigate('/institute/dashboard', { replace: true });
          } else if (instituteUser.status === 'pending') {
            console.log('🔄 Auto-redirecting to pending approval');
            navigate('/institute/pending-approval', { replace: true });
          } else if (instituteUser.status === 'rejected') {
            console.log('🔄 Auto-redirecting to rejected page');
            navigate('/institute/rejected', { replace: true });
          }
        }, 100);
      }
    }
  }, [instituteUser, loading, navigate]);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Memoized context value
  const contextValue = useMemo(() => ({
    // User data
    user: instituteUser,
    instituteUser,
    
    // State
    loading,
    error,
    
    // Auth methods
    login,
    loginWithResponse,
    logout,
    register, // FIXED - Proper data storage
    updateProfile,
    checkApprovalStatus,
    
    // Admin methods
    approveInstitute,
    rejectInstitute,
    getPendingInstitutes,
    getAllInstitutes,
    getInstituteById,
    getApprovalStats,
    
    // Status checks
    isAuthenticated,
    isApproved,
    isPending,
    isRejected,
    getUserStatus,
    
    // Utility methods
    clearError,
    refreshUser,
    getDemoInstitutes
  }), [
    instituteUser,
    loading,
    error,
    login,
    loginWithResponse,
    logout,
    register,
    updateProfile,
    checkApprovalStatus,
    approveInstitute,
    rejectInstitute,
    getPendingInstitutes,
    getAllInstitutes,
    getInstituteById,
    getApprovalStats,
    isAuthenticated,
    isApproved,
    isPending,
    isRejected,
    getUserStatus,
    clearError,
    refreshUser,
    getDemoInstitutes
  ]);

  return (
    <InstituteAuthContext.Provider value={contextValue}>
      {children}
    </InstituteAuthContext.Provider>
  );
}

export const useInstituteAuth = () => {
  const context = useContext(InstituteAuthContext);
  if (!context) {
    throw new Error('useInstituteAuth must be used within an InstituteAuthProvider');
  }
  return context;
};

export default InstituteAuthContext;