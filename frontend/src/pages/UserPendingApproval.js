// src/pages/PendingApproval.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PendingApproval() {
  const { user, logout } = useAuth();

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    card: {
      background: 'white',
      padding: '40px',
      borderRadius: '12px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '500px',
      textAlign: 'center'
    },
    icon: {
      fontSize: '4rem',
      marginBottom: '20px'
    },
    title: {
      margin: '0 0 15px 0',
      color: '#2c3e50',
      fontSize: '1.8rem',
      fontWeight: '600'
    },
    message: {
      color: '#7f8c8d',
      lineHeight: '1.6',
      marginBottom: '25px'
    },
    userInfo: {
      background: '#f8f9fa',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '25px',
      textAlign: 'left'
    },
    infoItem: {
      marginBottom: '8px',
      display: 'flex',
      justifyContent: 'space-between'
    },
    label: {
      fontWeight: '600',
      color: '#2c3e50'
    },
    value: {
      color: '#7f8c8d'
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    button: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      display: 'inline-block'
    },
    logoutButton: {
      backgroundColor: '#e74c3c',
      color: 'white'
    },
    homeButton: {
      backgroundColor: '#3498db',
      color: 'white'
    },
    contactInfo: {
      marginTop: '25px',
      padding: '15px',
      background: '#fff3cd',
      borderRadius: '8px',
      border: '1px solid #ffeaa7'
    },
    contactTitle: {
      margin: '0 0 10px 0',
      color: '#856404',
      fontSize: '1rem',
      fontWeight: '600'
    },
    contactText: {
      margin: '0',
      color: '#856404',
      fontSize: '0.9rem',
      lineHeight: '1.4'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>⏳</div>
        <h1 style={styles.title}>Account Pending Approval</h1>
        
        <p style={styles.message}>
          Thank you for registering! Your account is currently under review by our administration team. 
          You will receive an email notification once your account has been approved.
        </p>

        {user && (
          <div style={styles.userInfo}>
            <div style={styles.infoItem}>
              <span style={styles.label}>Name:</span>
              <span style={styles.value}>{user.name}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.label}>Email:</span>
              <span style={styles.value}>{user.email}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.label}>Status:</span>
              <span style={{...styles.value, color: '#f39c12', fontWeight: '600'}}>Pending Approval</span>
            </div>
          </div>
        )}

        <div style={styles.contactInfo}>
          <h3 style={styles.contactTitle}>Need Help?</h3>
          <p style={styles.contactText}>
            If you have any questions or need to update your registration information, 
            please contact our support team at support@example.com or call +1 (555) 123-4567.
          </p>
        </div>

        <div style={styles.buttonGroup}>
          <button 
            onClick={logout}
            style={{...styles.button, ...styles.logoutButton}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
          >
            Logout
          </button>
          <Link 
            to="/"
            style={{...styles.button, ...styles.homeButton}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
          >
            Go to Homepage
          </Link>
        </div>

        <div style={{ marginTop: '25px', fontSize: '0.9rem', color: '#bdc3c7' }}>
          <p>Typical approval time: 24-48 hours during business days</p>
        </div>
      </div>
    </div>
  );
}