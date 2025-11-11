import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Search, 
  Eye, 
  MessageSquare, 
  Star, 
  User,
  ArrowLeft,
  LogOut,
  Filter
} from 'lucide-react';

const QualityControl = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reportedContent, setReportedContent] = useState([]);
  const [qualityMetrics, setQualityMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  // Mock data
  const mockReportedContent = [
    {
      id: '1',
      type: 'review',
      content: 'This institute is terrible! The faculty is unprofessional and the facilities are outdated.',
      reporter: { name: 'John Doe', email: 'john@example.com' },
      reportedItem: { name: 'Global Education Institute', type: 'institute' },
      reason: 'Inappropriate language',
      status: 'pending',
      reportedAt: '2024-01-20T14:30:00Z',
      severity: 'high'
    },
    {
      id: '2',
      type: 'review',
      content: 'The courses are good but overpriced compared to other institutes.',
      reporter: { name: 'Sarah Wilson', email: 'sarah@example.com' },
      reportedItem: { name: 'Tech Skills Academy', type: 'institute' },
      reason: 'Misinformation',
      status: 'pending',
      reportedAt: '2024-01-19T11:20:00Z',
      severity: 'medium'
    },
    {
      id: '3',
      type: 'institute',
      content: 'Institute profile contains false accreditation information',
      reporter: { name: 'Mike Chen', email: 'mike@example.com' },
      reportedItem: { name: 'Creative Arts College', type: 'institute' },
      reason: 'False information',
      status: 'investigating',
      reportedAt: '2024-01-18T09:15:00Z',
      severity: 'high'
    },
    {
      id: '4',
      type: 'user',
      content: 'User is posting spam comments on multiple institute pages',
      reporter: { name: 'Admin System', email: 'system@edulist.com' },
      reportedItem: { name: 'Robert Brown', type: 'user' },
      reason: 'Spam',
      status: 'pending',
      reportedAt: '2024-01-17T16:45:00Z',
      severity: 'medium'
    }
  ];

  const mockQualityMetrics = {
    totalReports: 23,
    resolvedReports: 15,
    pendingReports: 8,
    avgResolutionTime: '2.3 days',
    userSatisfaction: 4.5,
    contentAccuracy: 92.7
  };

  useEffect(() => {
    loadQualityData();
  }, []);

  const loadQualityData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReportedContent(mockReportedContent);
      setQualityMetrics(mockQualityMetrics);
    } catch (error) {
      console.error('Error loading quality data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveContent = async (reportId) => {
    if (!window.confirm('Are you sure you want to approve this content?')) return;
    
    alert('Content approved and report dismissed');
    setReportedContent(prev => prev.filter(report => report.id !== reportId));
  };

  const handleRemoveContent = async (reportId) => {
    const reason = prompt('Please provide a reason for removal:');
    if (!reason) return;

    alert(`Content removed from platform. Reason: ${reason}`);
    setReportedContent(prev => prev.filter(report => report.id !== reportId));
  };

  const handleRequestEdit = async (reportId) => {
    const message = prompt('What edits would you like to request?');
    if (!message) return;

    alert('Edit request sent to content owner');
    setReportedContent(prev => prev.filter(report => report.id !== reportId));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'review': return <Star className="w-4 h-4" />;
      case 'institute': return <User className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredReports = reportedContent.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedItem.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === '' || report.type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quality control data...</p>
        </div>
      </div>
    );
  }

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
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quality Control</h1>
          <p className="text-gray-600">Monitor and maintain platform content quality</p>
        </div>

        {/* Quality Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{qualityMetrics.totalReports}</p>
                <p className="text-sm text-gray-600">Total Reports</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{qualityMetrics.resolvedReports}</p>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{qualityMetrics.pendingReports}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{qualityMetrics.avgResolutionTime}</p>
                <p className="text-sm text-gray-600">Avg. Resolution</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Filter className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="review">Reviews</option>
              <option value="institute">Institutes</option>
              <option value="user">Users</option>
            </select>
          </div>
        </div>

        {/* Reported Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Reported Content</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <div key={report.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(report.type)}
                          <h3 className="font-semibold text-gray-900">
                            {report.type === 'review' ? 'Review Report' : 
                             report.type === 'institute' ? 'Institute Report' : 'User Report'}
                          </h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                          {report.severity} priority
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{report.content}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Reported by:</strong> {report.reporter.name} ({report.reporter.email})
                        </div>
                        <div>
                          <strong>Reason:</strong> {report.reason}
                        </div>
                        <div>
                          <strong>Target:</strong> {report.reportedItem.name} ({report.reportedItem.type})
                        </div>
                        <div>
                          <strong>Reported:</strong> {new Date(report.reportedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApproveContent(report.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve Content</span>
                    </button>
                    <button
                      onClick={() => handleRemoveContent(report.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Remove Content</span>
                    </button>
                    <button 
                      onClick={() => handleRequestEdit(report.id)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Request Edit</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterType ? 'No reports match your search criteria' : 'No content reports to review'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityControl;