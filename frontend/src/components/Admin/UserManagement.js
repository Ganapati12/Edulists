import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Building, 
  Shield, 
  CheckCircle, 
  XCircle, 
  MoreVertical, 
  User, 
  UserCheck, 
  UserX,
  ArrowLeft,
  LogOut
} from 'lucide-react';

const UserManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    verified: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Mock user data
  const mockUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0101',
      role: 'user',
      status: 'active',
      verified: true,
      createdAt: '2024-01-15T10:30:00Z',
      lastLogin: '2024-01-20T14:20:00Z',
      institute: null
    },
    {
      id: '2',
      name: 'Global Education Institute',
      email: 'admin@globaledu.com',
      phone: '+1-555-0102',
      role: 'institute',
      status: 'approved',
      verified: true,
      createdAt: '2024-01-10T09:15:00Z',
      lastLogin: '2024-01-20T16:45:00Z',
      institute: {
        name: 'Global Education Institute',
        category: 'university'
      }
    },
    {
      id: '3',
      name: 'Tech Skills Academy',
      email: 'info@techskills.edu',
      phone: '+1-555-0103',
      role: 'institute',
      status: 'pending',
      verified: false,
      createdAt: '2024-01-18T11:20:00Z',
      lastLogin: null,
      institute: {
        name: 'Tech Skills Academy',
        category: 'coaching'
      }
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      phone: '+1-555-0104',
      role: 'user',
      status: 'active',
      verified: true,
      createdAt: '2024-01-12T08:45:00Z',
      lastLogin: '2024-01-19T11:30:00Z',
      institute: null
    },
    {
      id: '5',
      name: 'Admin User',
      email: 'admin@edulist.com',
      phone: '+1-555-0100',
      role: 'admin',
      status: 'active',
      verified: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: '2024-01-20T18:20:00Z',
      institute: null
    },
    {
      id: '6',
      name: 'Creative Arts College',
      email: 'contact@creativearts.edu',
      phone: '+1-555-0105',
      role: 'institute',
      status: 'rejected',
      verified: false,
      createdAt: '2024-01-16T13:10:00Z',
      lastLogin: null,
      institute: {
        name: 'Creative Arts College',
        category: 'college'
      },
      rejectionReason: 'Incomplete documentation'
    }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to get users from localStorage first, then fallback to mock data
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const localInstitutes = JSON.parse(localStorage.getItem('institutes') || '[]');
      
      // Combine and format data
      const formattedUsers = [
        ...localUsers.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: 'user',
          status: u.status || 'active',
          verified: u.verified || false,
          createdAt: u.createdAt,
          lastLogin: u.lastLogin,
          institute: null
        })),
        ...localInstitutes.map(inst => ({
          id: inst.id,
          name: inst.name,
          email: inst.email,
          phone: inst.phone,
          role: 'institute',
          status: inst.status || 'pending',
          verified: inst.verified || false,
          createdAt: inst.createdAt,
          lastLogin: inst.lastLogin,
          institute: {
            name: inst.name,
            category: inst.category
          },
          rejectionReason: inst.rejectionReason
        }))
      ];

      // Add admin user and mock data if no local data
      if (formattedUsers.length === 0) {
        setUsers(mockUsers);
      } else {
        setUsers([...formattedUsers, ...mockUsers.filter(m => m.role === 'admin')]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.institute?.name && user.institute.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Role filter
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    // Verified filter
    if (filters.verified === 'verified') {
      filtered = filtered.filter(user => user.verified);
    } else if (filters.verified === 'unverified') {
      filtered = filtered.filter(user => !user.verified);
    }

    setFilteredUsers(filtered);
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    setActionLoading(userId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      
      alert(`User status updated to ${newStatus}`);
      
      // Close details if open
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setActionLoading(userId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      alert('User deleted successfully');
      
      // Close details if open
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'institute': return <Building className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: UserCheck },
      approved: { color: 'bg-green-100 text-green-800', icon: UserCheck },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: User },
      rejected: { color: 'bg-red-100 text-red-800', icon: UserX },
      suspended: { color: 'bg-gray-100 text-gray-800', icon: UserX }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'bg-purple-100 text-purple-800', label: 'Admin' },
      institute: { color: 'bg-blue-100 text-blue-800', label: 'Institute' },
      user: { color: 'bg-gray-100 text-gray-800', label: 'User' }
    };
    
    const config = roleConfig[role] || roleConfig.user;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {getRoleIcon(role)}
        <span className="ml-1">{config.label}</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const UserCard = ({ user }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            {user.verified && (
              <CheckCircle className="w-4 h-4 text-green-500" title="Verified" />
            )}
          </div>
          
          <div className="flex items-center text-gray-600 mb-1">
            <Mail className="w-4 h-4 mr-2" />
            <span className="text-sm">{user.email}</span>
          </div>
          
          {user.phone && (
            <div className="flex items-center text-gray-600 mb-3">
              <Phone className="w-4 h-4 mr-2" />
              <span className="text-sm">{user.phone}</span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {getRoleBadge(user.role)}
            {getStatusBadge(user.status)}
          </div>
          
          {user.institute && (
            <div className="mt-2 text-sm text-gray-600">
              <Building className="w-4 h-4 inline mr-1" />
              {user.institute.name}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Joined: {formatDate(user.createdAt)}</span>
          <span>Last login: {formatDate(user.lastLogin)}</span>
        </div>
        
        <div className="flex space-x-2 mt-3">
          {user.role === 'institute' && user.status === 'pending' && (
            <button
              onClick={() => handleUpdateStatus(user.id, 'approved')}
              disabled={actionLoading === user.id}
              className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors text-sm font-medium"
            >
              {actionLoading === user.id ? '...' : 'Approve'}
            </button>
          )}
          
          {user.status === 'active' && user.role !== 'admin' && (
            <button
              onClick={() => handleUpdateStatus(user.id, 'suspended')}
              disabled={actionLoading === user.id}
              className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded-lg hover:bg-yellow-700 disabled:bg-yellow-400 transition-colors text-sm font-medium"
            >
              {actionLoading === user.id ? '...' : 'Suspend'}
            </button>
          )}
          
          {user.status === 'suspended' && (
            <button
              onClick={() => handleUpdateStatus(user.id, 'active')}
              disabled={actionLoading === user.id}
              className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors text-sm font-medium"
            >
              {actionLoading === user.id ? '...' : 'Activate'}
            </button>
          )}
          
          {user.role !== 'admin' && (
            <button
              onClick={() => handleDeleteUser(user.id)}
              disabled={actionLoading === user.id}
              className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors text-sm font-medium"
            >
              {actionLoading === user.id ? '...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-semibold">{user?.name || 'Admin'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span className="text-red-700 font-medium text-sm">Logout</span>
              </button>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">
            Manage all users, institutes, and administrators on the platform
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or institute..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {/* Role Filter */}
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Roles</option>
                <option value="user">Users</option>
                <option value="institute">Institutes</option>
                <option value="admin">Admins</option>
              </select>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Verified Filter */}
              <select
                value={filters.verified}
                onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Verification</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'user').length}</p>
                <p className="text-sm text-gray-600">Regular Users</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'institute').length}</p>
                <p className="text-sm text-gray-600">Institutes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'active' || u.status === 'approved').length}</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <UserX className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'pending').length}</p>
                <p className="text-sm text-gray-600">Pending Approval</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map(user => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {searchTerm || Object.values(filters).some(f => f) 
                ? 'No users match your search criteria' 
                : 'No users registered yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;