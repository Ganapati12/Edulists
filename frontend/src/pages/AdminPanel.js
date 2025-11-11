// src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const { user, getPendingUsers, approveUser, rejectUser, logout, getUsers } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadUsers();
    } else {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  const loadUsers = () => {
    const pending = getPendingUsers();
    const all = getUsers();
    setPendingUsers(pending);
    setAllUsers(all);
    setLoading(false);
  };

  const handleApprove = async (userId) => {
    setLoading(true);
    const result = await approveUser(userId);
    if (result.success) {
      setMessage({ type: 'success', text: 'User approved successfully!' });
      loadUsers();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to approve user' });
    }
    setLoading(false);
  };

  const handleReject = async (userId) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason && reason.trim()) {
      setLoading(true);
      const result = await rejectUser(userId, reason.trim());
      if (result.success) {
        setMessage({ type: 'success', text: 'User rejected successfully!' });
        loadUsers();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to reject user' });
      }
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const styles = {
    container: {
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f8f9fa'
    },
    header: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '30px'
    },
    title: {
      margin: '0 0 10px 0',
      color: '#2c3e50',
      fontSize: '2rem',
      fontWeight: '600'
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    card: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '30px'
    },
    userCard: {
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '15px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    userInfo: {
      flex: 1
    },
    userName: {
      margin: '0 0 5px 0',
      color: '#2c3e50',
      fontSize: '1.1rem',
      fontWeight: '600'
    },
    userEmail: {
      margin: '0 0 5px 0',
      color: '#7f8c8d'
    },
    userDate: {
      margin: '0',
      color: '#bdc3c7',
      fontSize: '0.9rem'
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px'
    },
    button: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    approveButton: {
      backgroundColor: '#27ae60',
      color: 'white'
    },
    rejectButton: {
      backgroundColor: '#e74c3c',
      color: 'white'
    },
    message: {
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontWeight: '500',
      textAlign: 'center'
    },
    success: {
      background: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    error: {
      background: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px',
      color: '#7f8c8d'
    },
    headerActions: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-start',
      marginTop: '15px'
    },
    logoutButton: {
      padding: '10px 20px',
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600'
    },
    tabContainer: {
      display: 'flex',
      borderBottom: '1px solid #e9ecef',
      marginBottom: '20px'
    },
    tab: {
      padding: '12px 24px',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      borderBottom: '2px solid transparent',
      transition: 'all 0.3s ease'
    },
    activeTab: {
      borderBottomColor: '#3498db',
      color: '#3498db'
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.card}>
            <h2 style={{ textAlign: 'center', color: '#e74c3c' }}>Access Denied</h2>
            <p style={{ textAlign: 'center' }}>You need admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin User Management</h1>
          <p>Manage user registrations and approvals</p>
          <div style={styles.headerActions}>
            <button 
              onClick={logout}
              style={styles.logoutButton}
              onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
            >
              Logout
            </button>
          </div>
        </div>

        {message && (
          <div style={{
            ...styles.message,
            ...(message.type === 'success' ? styles.success : styles.error)
          }}>
            {message.text}
          </div>
        )}

        <div style={styles.card}>
          <div style={styles.tabContainer}>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'pending' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('pending')}
            >
              Pending Approval ({pendingUsers.length})
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'all' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('all')}
            >
              All Users ({allUsers.length})
            </button>
          </div>

          {loading ? (
            <div style={styles.emptyState}>Loading...</div>
          ) : activeTab === 'pending' ? (
            pendingUsers.length === 0 ? (
              <div style={styles.emptyState}>
                <h3>No pending approvals</h3>
                <p>All users have been processed.</p>
              </div>
            ) : (
              pendingUsers.map(user => (
                <div key={user.id} style={styles.userCard}>
                  <div style={styles.userInfo}>
                    <h3 style={styles.userName}>{user.name}</h3>
                    <p style={styles.userEmail}>{user.email}</p>
                    <p style={styles.userDate}>
                      Registered: {new Date(user.registeredAt).toLocaleDateString()}
                    </p>
                    {user.phone && <p style={styles.userEmail}>Phone: {user.phone}</p>}
                  </div>
                  <div style={styles.buttonGroup}>
                    <button
                      onClick={() => handleApprove(user.id)}
                      style={{...styles.button, ...styles.approveButton}}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#219a52'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(user.id)}
                      style={{...styles.button, ...styles.rejectButton}}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            <div>
              {allUsers.length === 0 ? (
                <div style={styles.emptyState}>
                  <h3>No users found</h3>
                  <p>User registrations will appear here.</p>
                </div>
              ) : (
                allUsers.map(user => (
                  <div key={user.id} style={styles.userCard}>
                    <div style={styles.userInfo}>
                      <h3 style={styles.userName}>{user.name}</h3>
                      <p style={styles.userEmail}>{user.email}</p>
                      <p style={styles.userDate}>
                        Registered: {new Date(user.registeredAt).toLocaleDateString()}
                        {user.approvedAt && ` • Approved: ${new Date(user.approvedAt).toLocaleDateString()}`}
                      </p>
                      {user.phone && <p style={styles.userEmail}>Phone: {user.phone}</p>}
                    </div>
                    <div>
                      {getStatusBadge(user.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>Admin Instructions</h3>
          <div style={{ lineHeight: '1.6', color: '#5a6c7d' }}>
            <p><strong>Approval Process:</strong></p>
            <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
              <li>Review user registration details</li>
              <li>Click "Approve" to activate user account</li>
              <li>Click "Reject" to deny registration (provide reason)</li>
              <li>Approved users can immediately login and access the platform</li>
            </ul>
            <p><strong>Current Status:</strong></p>
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>Pending Users:</strong> {pendingUsers.length}</li>
              <li><strong>Total Users:</strong> {allUsers.length}</li>
              <li><strong>Approved Users:</strong> {allUsers.filter(u => u.status === 'approved').length}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}