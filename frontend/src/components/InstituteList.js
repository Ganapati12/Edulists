// Safe version of InstituteList component
import React, { useState, useEffect } from 'react';

const InstituteList = () => {
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with your actual data source
  const mockInstitutes = [
    {
      id: 1,
      name: 'Tech University',
      category: 'University',
      location: 'Boston, MA',
      rating: 4.5,
      courses: 45,
      established: 1995,
      image: null
    },
    {
      id: 2,
      name: 'Code Academy',
      category: 'Training Center', 
      location: 'San Francisco, CA',
      rating: 4.2,
      courses: 23,
      established: 2010,
      image: null
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setInstitutes(mockInstitutes);
      setLoading(false);
    }, 1000);
  }, []);

  // Safe function to get initials
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') {
      return '??';
    }
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading institutes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Educational Institutes</h1>
          <p className="text-gray-600">Browse through our partner institutions</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Search institutes by name, location, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Institutes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {institutes.map((institute) => (
            <div key={institute.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {getInitials(institute.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {institute.name || 'Unknown Institute'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{institute.category}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-3">📍 {institute.location}</span>
                      <span>⭐ {institute.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  <span>📚 {institute.courses} courses</span>
                  <span>🏛️ Est. {institute.established}</span>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => window.location.href = `/institutes/${institute.id}`}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {institutes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏫</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Institutes Available</h3>
            <p className="text-gray-500">Check back later for new institute listings</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstituteList;