// src/pages/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const { user, logout, getUsers, isUserApproved } = useAuth();
  const [userData, setUserData] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get user data from storage
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        console.log('🔄 Loading user data for:', user.email);
        try {
          const users = getUsers ? getUsers() : [];
          const currentUser = users.find(u => u.id === user.id || u.email === user.email);
          console.log('📊 Found user data:', currentUser);
          setUserData(currentUser || user);
        } catch (error) {
          console.error('❌ Error loading user data:', error);
          setUserData(user); // Fallback to basic user data
        }
      }
      setLoading(false);
    };

    loadUserData();
  }, [user, getUsers]);

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      backgroundColor: 'white',
      padding: windowWidth <= 768 ? '20px' : '30px',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '30px',
      textAlign: 'center'
    },
    title: {
      margin: '0 0 10px 0',
      color: '#2c3e50',
      fontSize: windowWidth <= 768 ? '1.5rem' : '2rem',
      fontWeight: '600'
    },
    subtitle: {
      margin: '0',
      color: '#7f8c8d',
      fontSize: windowWidth <= 768 ? '1rem' : '1.1rem'
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    profileCard: {
      backgroundColor: 'white',
      padding: windowWidth <= 768 ? '20px' : '30px',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '30px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: windowWidth <= 768 ? '20px' : '30px',
      marginBottom: '30px'
    },
    infoCard: {
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      height: '100%'
    },
    cardTitle: {
      margin: '0 0 15px 0',
      color: '#2c3e50',
      fontSize: '1.3rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    infoItem: {
      marginBottom: '12px',
      display: 'flex',
      alignItems: windowWidth <= 768 ? 'flex-start' : 'center',
      gap: '10px',
      flexDirection: windowWidth <= 768 ? 'column' : 'row'
    },
    label: {
      fontWeight: '600',
      color: '#34495e',
      minWidth: windowWidth <= 768 ? 'auto' : '120px'
    },
    value: {
      color: '#2c3e50'
    },
    status: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '600',
      display: 'inline-block'
    },
    pending: {
      backgroundColor: '#fff3cd',
      color: '#856404'
    },
    approved: {
      backgroundColor: '#d4edda',
      color: '#155724'
    },
    rejected: {
      backgroundColor: '#f8d7da',
      color: '#721c24'
    },
    features: {
      listStyle: 'none',
      padding: '0',
      margin: '0'
    },
    featureItem: {
      padding: '8px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      color: '#2c3e50'
    },
    actionGrid: {
      display: 'grid',
      gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginTop: '20px'
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      padding: '15px 20px',
      backgroundColor: '#3498db',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      textAlign: 'center',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 'inherit'
    },
    warningBox: {
      backgroundColor: '#fff3cd',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #ffeaa7',
      marginTop: '20px'
    },
    errorBox: {
      backgroundColor: '#f8d7da',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #f5c6cb',
      marginTop: '20px'
    },
    warningTitle: {
      margin: '0 0 10px 0',
      color: '#856404',
      fontSize: '1.1rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    errorTitle: {
      margin: '0 0 10px 0',
      color: '#721c24',
      fontSize: '1.1rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    warningText: {
      margin: '0',
      color: '#856404',
      lineHeight: '1.5'
    },
    errorText: {
      margin: '0',
      color: '#721c24',
      lineHeight: '1.5'
    },
    icon: {
      fontSize: '1.2rem'
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      color: '#7f8c8d'
    },
    logoutButton: {
      padding: '10px 20px',
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      marginTop: '20px',
      transition: 'all 0.3s ease'
    },
    headerActions: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
      marginTop: '15px',
      flexWrap: 'wrap'
    }
  };

  // Determine user status dynamically
  const getUserStatus = () => {
    if (!userData) return 'unknown';
    return userData.status || userData.approvalStatus || 'pending';
  };

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    logout();
    navigate('/user/login', { 
      replace: true,
      state: { logoutMessage: 'You have been successfully logged out.' }
    });
  };

  const isApproved = isUserApproved ? isUserApproved() : getUserStatus() === 'approved';
  const userStatus = getUserStatus();

  console.log('📊 Dashboard State:', {
    user,
    userData,
    isApproved,
    userStatus
  });

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.profileCard}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3 style={{ color: '#e74c3c', marginBottom: '20px' }}>Access Denied</h3>
              <p>Please log in to access your dashboard.</p>
              <Link 
                to="/user/login" 
                style={{
                  ...styles.actionButton,
                  display: 'inline-flex',
                  width: 'auto',
                  padding: '12px 24px',
                  marginTop: '20px'
                }}
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.loading}>
            <h3>Loading your dashboard...</h3>
            <p>Please wait while we load your information.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>User Dashboard</h1>
          <p style={styles.subtitle}>
            Welcome back, {userData?.name || userData?.email || 'User'}!
          </p>
          <div style={styles.headerActions}>
            <button 
              onClick={handleLogout}
              style={styles.logoutButton}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#c0392b';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#e74c3c';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🚪 Logout
            </button>
            <Link 
              to="/user/profile" 
              style={{
                ...styles.actionButton,
                display: 'inline-flex',
                width: 'auto',
                padding: '10px 20px',
                backgroundColor: '#27ae60'
              }}
            >
              👤 Edit Profile
            </Link>
          </div>
        </div>

        <div>
          {/* Profile Information */}
          <div style={styles.profileCard}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px',
              alignItems: 'start'
            }}>
              <div>
                <h3 style={styles.cardTitle}>
                  <span style={styles.icon}>👤</span>
                  Profile Information
                </h3>
                <div style={styles.infoItem}>
                  <span style={styles.label}>Name:</span>
                  <span style={styles.value}>{userData?.name || 'Not provided'}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.label}>Email:</span>
                  <span style={styles.value}>{userData?.email}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.label}>User ID:</span>
                  <span style={styles.value}>{userData?.id || 'N/A'}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.label}>Account Status:</span>
                  <span style={{
                    ...styles.status,
                    ...(userStatus === 'approved' ? styles.approved : 
                        userStatus === 'rejected' ? styles.rejected : styles.pending)
                  }}>
                    {userStatus === 'approved' ? '✅ Approved' : 
                     userStatus === 'rejected' ? '❌ Rejected' : '⏳ Pending Approval'}
                  </span>
                </div>
                {userStatus === 'rejected' && userData?.rejectionReason && (
                  <div style={styles.infoItem}>
                    <span style={styles.label}>Rejection Reason:</span>
                    <span style={styles.value}>{userData.rejectionReason}</span>
                  </div>
                )}
                {userData?.registeredAt && (
                  <div style={styles.infoItem}>
                    <span style={styles.label}>Registered:</span>
                    <span style={styles.value}>
                      {new Date(userData.registeredAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {userData?.approvedAt && (
                  <div style={styles.infoItem}>
                    <span style={styles.label}>Approved On:</span>
                    <span style={styles.value}>
                      {new Date(userData.approvedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {isApproved ? (
                <div>
                  <h3 style={styles.cardTitle}>
                    <span style={styles.icon}>🚀</span>
                    Quick Actions
                  </h3>
                  <div style={styles.actionGrid}>
                    <Link 
                      to="/institutes" 
                      style={styles.actionButton}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#2980b9';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#3498db';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <span style={styles.icon}>🏫</span>
                      Browse Institutes
                    </Link>
                    <Link 
                      to="/search" 
                      style={{
                        ...styles.actionButton,
                        backgroundColor: '#27ae60'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#219a52';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#27ae60';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <span style={styles.icon}>🔍</span>
                      Search Institutions
                    </Link>
                    <Link 
                      to="/enquiries" 
                      style={{
                        ...styles.actionButton,
                        backgroundColor: '#e67e22'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#d35400';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#e67e22';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <span style={styles.icon}>📝</span>
                      My Enquiries
                    </Link>
                  </div>
                </div>
              ) : userStatus === 'pending' ? (
                <div style={styles.warningBox}>
                  <h4 style={styles.warningTitle}>
                    <span style={styles.icon}>⏳</span>
                    Waiting for Admin Approval
                  </h4>
                  <p style={styles.warningText}>
                    Your account is currently pending approval. Once an administrator approves 
                    your account, you'll be able to browse institutes, view courses, and make 
                    enquiries. You'll receive an email notification when your account is approved.
                  </p>
                  <p style={styles.warningText}>
                    <strong>Estimated Time:</strong> Approval typically takes 24-48 hours during business days.
                  </p>
                </div>
              ) : userStatus === 'rejected' ? (
                <div style={styles.errorBox}>
                  <h4 style={styles.errorTitle}>
                    <span style={styles.icon}>❌</span>
                    Account Rejected
                  </h4>
                  <p style={styles.errorText}>
                    Your account registration has been rejected. 
                    {userData?.rejectionReason && ` Reason: ${userData.rejectionReason}`}
                    {!userData?.rejectionReason && ' Please contact support for more information.'}
                  </p>
                  <p style={styles.errorText}>
                    If you believe this is a mistake, please contact our support team at support@example.com.
                  </p>
                </div>
              ) : (
                <div style={styles.warningBox}>
                  <h4 style={styles.warningTitle}>
                    <span style={styles.icon}>❓</span>
                    Unknown Status
                  </h4>
                  <p style={styles.warningText}>
                    Your account status could not be determined. Please contact support if you believe this is an error.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Features Grid - Only show for approved users */}
          {isApproved && (
            <div style={styles.grid}>
              <div style={styles.infoCard}>
                <h3 style={styles.cardTitle}>
                  <span style={styles.icon}>🏫</span>
                  Browse Institutions
                </h3>
                <ul style={styles.features}>
                  <li style={styles.featureItem}>
                    <span style={styles.icon}>🔍</span>
                    Search by name, city, category, or board
                  </li>
                  <li style={styles.featureItem}>
                    <span style={styles.icon}>📊</span>
                    Apply filters (location, fees, facilities)
                  </li>
                  <li style={styles.featureItem}>
                    <span style={styles.icon}>⭐</span>
                    View ratings and reviews
                  </li>
                  <li style={styles.featureItem}>
                    <span style={styles.icon}>📋</span>
                    Detailed profile pages with courses
                  </li>
                </ul>
              </div>

              <div style={styles.infoCard}>
                <h3 style={styles.cardTitle}>
                  <span style={styles.icon}>💬</span>
                  Reviews & Enquiries
                </h3>
                <ul style={styles.features}>
                  <li style={styles.featureItem}>
                    <span style={styles.icon}>✍️</span>
                    Submit reviews and ratings
                  </li>
                  <li style={styles.featureItem}>
                    <span style={styles.icon}>📞</span>
                    Contact institutes via enquiry form
                  </li>
                  <li style={styles.featureItem}>
                    <span style={styles.icon}>📱</span>
                    Responsive design for all devices
                  </li>
                  <li style={styles.featureItem}>
                    <span style={styles.icon}>🔔</span>
                    Track your enquiries
                  </li>
                </ul>
              </div>

              <div style={styles.infoCard}>
                <h3 style={styles.cardTitle}>
                  <span style={styles.icon}>⚙️</span>
                  Account Management
                </h3>
                <ul style={styles.features}>
                  <li style={styles.featureItem}>
                    <span style={styles.icon}>👤</span>
                    Update profile information
                  </li>
                  <li style={styles.featureItem}>
                    <span style={styles.icon}>🔒</span>
                    Change password
                  </li>
                  <li style={styles.featureItem}>
                    <span style={styles.icon}>📨</span>
                    Manage notifications
                  </li>
                  <li style={styles.featureItem}>
                    <span style={styles.icon}>❤️</span>
                    Save favorite institutes
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Recent Activity Section */}
          <div style={styles.infoCard}>
            <h3 style={styles.cardTitle}>
              <span style={styles.icon}>📈</span>
              Recent Activity
            </h3>
            {isApproved ? (
              <div>
                <p style={{ color: '#7f8c8d', lineHeight: '1.6', marginBottom: '15px' }}>
                  Your recent activities will appear here once you start using the platform.
                </p>
                <div style={styles.actionGrid}>
                  <Link 
                    to="/institutes" 
                    style={{
                      ...styles.actionButton,
                      backgroundColor: '#9b59b6'
                    }}
                  >
                    🏫 Start Browsing Institutes
                  </Link>
                  <Link 
                    to="/search" 
                    style={{
                      ...styles.actionButton,
                      backgroundColor: '#e67e22'
                    }}
                  >
                    🔍 Search for Courses
                  </Link>
                </div>
              </div>
            ) : (
              <p style={{ color: '#7f8c8d', lineHeight: '1.6' }}>
                Your activity history will be available once your account is approved.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}