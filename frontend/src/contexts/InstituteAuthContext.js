// src/contexts/InstituteAuthContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { database } from '../services/database';
import { useAuth } from './AuthContext';

const InstituteAuthContext = createContext();

export const useInstituteAuth = () => {
  const context = useContext(InstituteAuthContext);
  if (!context) {
    throw new Error('useInstituteAuth must be used within an InstituteAuthProvider');
  }
  return context;
};

export const InstituteAuthProvider = ({ children }) => {
  const { user, login, register, updateProfile, approveInstitute, rejectInstitute } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Institute-specific login
  const instituteLogin = useCallback(async (email, password) => {
    return await login(email, password, 'institute');
  }, [login]);

  // Institute registration
  const instituteRegister = useCallback(async (instituteData) => {
    return await register(instituteData, 'institute');
  }, [register]);

  // Get institute courses
  const getInstituteCourses = useCallback((instituteId) => {
    return database.getCoursesByInstitute(instituteId);
  }, []);

  // Add course
  const addCourse = useCallback(async (courseData) => {
    if (!user || user.role !== 'institute') {
      setError('Institute access required');
      return { success: false, message: 'Institute access required' };
    }

    try {
      const data = database.getData();
      const newCourse = {
        id: `course_${Date.now()}`,
        ...courseData,
        instituteId: user.id,
        instituteName: user.name,
        createdAt: new Date().toISOString(),
        enrolledStudents: 0,
        rating: 0
      };

      data.courses.push(newCourse);
      
      // Update institute course count
      const institute = data.institutes.find(inst => inst.id === user.id);
      if (institute) {
        institute.courses.push(newCourse.id);
        institute.stats.courses = institute.courses.length;
      }

      database.saveData(data);
      return { success: true, course: newCourse };
    } catch (err) {
      console.error('Error adding course:', err);
      setError('Failed to add course');
      return { success: false, message: 'Failed to add course' };
    }
  }, [user]);

  // Get institute enquiries
  const getInstituteEnquiries = useCallback(() => {
    if (!user || user.role !== 'institute') return [];
    return database.getEnquiriesByInstitute(user.id);
  }, [user]);

  // Get institute reviews
  const getInstituteReviews = useCallback(() => {
    if (!user || user.role !== 'institute') return [];
    return database.getReviewsByInstitute(user.id);
  }, [user]);

  // Update institute profile
  const updateInstituteProfile = useCallback(async (updates) => {
    return await updateProfile(updates);
  }, [updateProfile]);

  // Institute stats
  const getInstituteStats = useCallback(() => {
    if (!user || user.role !== 'institute') return null;
    
    const institute = database.getInstituteById(user.id);
    const enquiries = database.getEnquiriesByInstitute(user.id);
    const reviews = database.getReviewsByInstitute(user.id);
    const courses = database.getCoursesByInstitute(user.id);

    return {
      ...institute.stats,
      totalEnquiries: enquiries.length,
      newEnquiries: enquiries.filter(e => e.status === 'new').length,
      totalReviews: reviews.length,
      totalCourses: courses.length,
      averageRating: institute.stats.rating
    };
  }, [user]);

  const value = {
    // Inherited from main auth
    user,
    loading,
    error,
    
    // Institute-specific auth
    login: instituteLogin,
    register: instituteRegister,
    
    // Institute management
    getInstituteCourses,
    addCourse,
    getInstituteEnquiries,
    getInstituteReviews,
    updateProfile: updateInstituteProfile,
    getInstituteStats,
    
    // Admin functions
    approveInstitute,
    rejectInstitute,
    
    // Utility
    isAuthenticated: () => !!user && user.role === 'institute',
    isApproved: () => user?.status === 'approved',
    isPending: () => user?.status === 'pending',
    clearError: () => setError('')
  };

  return (
    <InstituteAuthContext.Provider value={value}>
      {children}
    </InstituteAuthContext.Provider>
  );
};

export default InstituteAuthContext;