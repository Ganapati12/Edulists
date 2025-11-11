import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useInstituteAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('institute_token');
        const savedUser = localStorage.getItem('institute_user');

        if (token && savedUser) {
          const userData = JSON.parse(savedUser);
          
          if (userData.role === 'institute') {
            if (userData.status !== 'approved') {
              localStorage.setItem('pendingInstitute', JSON.stringify(userData));
              navigate('/institute/pending-approval');
              return;
            }
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('institute_token');
        localStorage.removeItem('institute_user');
        localStorage.removeItem('pendingInstitute');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const login = async (credentials) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser = {
        _id: '1',
        name: 'Institute Admin',
        email: credentials.email,
        role: 'institute',
        status: 'approved',
        instituteName: 'Global Education Institute',
        phone: '+1 (555) 123-4567'
      };
      
      const mockToken = 'mock-jwt-token-for-institute';
      
      if (mockUser.status !== 'approved') {
        localStorage.setItem('pendingInstitute', JSON.stringify(mockUser));
        throw new Error('INSTITUTE_PENDING_APPROVAL');
      }

      localStorage.setItem('institute_token', mockToken);
      localStorage.setItem('institute_user', JSON.stringify(mockUser));
      setUser(mockUser);

      return { success: true, user: mockUser };
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockUser = {
        _id: '2',
        name: userData.contactPerson,
        email: userData.email,
        role: 'institute',
        status: 'pending',
        instituteName: userData.instituteName,
        phone: userData.phone
      };
      
      const mockToken = 'mock-jwt-token-for-pending-institute';
      
      localStorage.setItem('pendingInstitute', JSON.stringify(mockUser));
      localStorage.setItem('institute_token', mockToken);
      localStorage.setItem('institute_user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      return { success: true, user: mockUser };
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('institute_token');
    localStorage.removeItem('institute_user');
    localStorage.removeItem('pendingInstitute');
    setUser(null);
    navigate('/institute/login');
  };

  const checkApprovalStatus = async () => {
    try {
      const token = localStorage.getItem('institute_token');
      if (!token) return false;

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedUser = localStorage.getItem('institute_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        
        if (userData.status === 'pending') {
          const shouldApprove = Math.random() > 0.5;
          if (shouldApprove) {
            const approvedUser = { ...userData, status: 'approved' };
            localStorage.setItem('institute_user', JSON.stringify(approvedUser));
            setUser(approvedUser);
            localStorage.removeItem('pendingInstitute');
            return true;
          }
        } else if (userData.status === 'approved') {
          localStorage.removeItem('pendingInstitute');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking approval status:', error);
      return false;
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    checkApprovalStatus
  };
};