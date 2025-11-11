import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Building, 
  Eye, 
  Star, 
  ArrowLeft,
  LogOut,
  BarChart3,
  Calendar
} from 'lucide-react';

const PlatformAnalytics = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({});
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  // Mock analytics data
  const mockAnalytics = {
    overview: {
      totalUsers: 2847,
      totalInstitutes: 156,
      totalReviews: 8923,
      activeUsers: 1245,
      growthRate: 15.3,
      satisfactionRate: 4.2
    },
    userGrowth: [
      { month: 'Jan', users: 1200, institutes: 45 },
      { month: 'Feb', users: 1450, institutes: 52 },
      { month: 'Mar', users: 1680, institutes: 61 },
      { month: 'Apr', users: 1920, institutes: 73 },
      { month: 'May', users: 2150, institutes: 85 },
      { month: 'Jun', users: 2480, institutes: 98 },
      { month: 'Jul', users: 2847, institutes: 112 }
    ],
    instituteCategories: [
      { name: 'Universities', value: 35 },
      { name: 'Colleges', value: 28 },
      { name: 'Coaching', value: 22 },
      { name: 'Vocational', value: 15 }
    ],
    trafficSources: [
      { source: 'Direct', visitors: 1245 },
      { source: 'Google', visitors: 856 },
      { source: 'Social Media', visitors: 423 },
      { source: 'Referral', visitors: 287 }
    ],
    topInstitutes: [
      { name: 'Global Education', reviews: 245, rating: 4.8 },
      { name: 'Tech Skills Academy', reviews: 189, rating: 4.7 },
      { name: 'Creative Arts College', reviews: 167, rating: 4.6 },
      { name: 'Business School Pro', reviews: 142, rating: 4.5 },
      { name: 'Science Institute', reviews: 128, rating: 4.4 }
    ]
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
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
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
              <p className="text-gray-600 mt-2">Comprehensive insights into platform performance</p>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalUsers}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-3 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+{analytics.overview.growthRate}% growth</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalInstitutes}</p>
                <p className="text-sm text-gray-600">Institutes</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Building className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-3 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12% this month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalReviews}</p>
                <p className="text-sm text-gray-600">Reviews</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-3 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+23% this month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.activeUsers}</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-3 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Online now</span>
            </div>
          </div>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Table */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User & Institute Growth</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Month</th>
                    <th className="text-right py-2">Users</th>
                    <th className="text-right py-2">Institutes</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.userGrowth.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.month}</td>
                      <td className="text-right py-2">{item.users.toLocaleString()}</td>
                      <td className="text-right py-2">{item.institutes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Institute Categories */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Institute Categories</h3>
            <div className="space-y-3">
              {analytics.instituteCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{category.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${category.value}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{category.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Traffic Sources */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
            <div className="space-y-3">
              {analytics.trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{source.source}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(source.visitors / 2811) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12">{source.visitors.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Institutes */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Institutes by Reviews</h3>
            <div className="space-y-4">
              {analytics.topInstitutes.map((institute, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{institute.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{institute.rating}</span>
                        <span>•</span>
                        <span>{institute.reviews} reviews</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.growthRate}%</p>
              <p className="text-sm text-gray-600">Monthly Growth</p>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.satisfactionRate}/5</p>
              <p className="text-sm text-gray-600">Avg. Rating</p>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{(analytics.overview.activeUsers / analytics.overview.totalUsers * 100).toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Active Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformAnalytics;