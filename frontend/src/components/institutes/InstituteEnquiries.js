// src/components/institutes/InstituteEnquiries.jsx
import React, { useState, useEffect } from 'react';
import { Mail, Calendar, User, BookOpen, MessageCircle, Search, Filter } from 'lucide-react';

const InstituteEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadEnquiries();
  }, []);

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockEnquiries = [
        {
          _id: '1',
          studentName: 'John Doe',
          studentEmail: 'john@example.com',
          course: 'Computer Science Engineering',
          message: 'I am interested in learning more about the admission process and scholarship opportunities.',
          status: 'new',
          createdAt: '2024-01-15T10:30:00Z',
          repliedAt: null,
          replyMessage: null
        },
        {
          _id: '2',
          studentName: 'Sarah Wilson',
          studentEmail: 'sarah@example.com',
          course: 'Business Administration',
          message: 'Could you please share the detailed curriculum and faculty information?',
          status: 'replied',
          createdAt: '2024-01-14T14:20:00Z',
          repliedAt: '2024-01-14T16:45:00Z',
          replyMessage: 'Thank you for your interest. I have attached the curriculum document and faculty profiles.'
        }
      ];
      
      setEnquiries(mockEnquiries);
    } catch (error) {
      console.error('Error loading enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (enquiryId) => {
    if (!replyText.trim()) return;

    try {
      // Send reply logic
      const updatedEnquiries = enquiries.map(enquiry => 
        enquiry._id === enquiryId 
          ? {
              ...enquiry,
              status: 'replied',
              repliedAt: new Date().toISOString(),
              replyMessage: replyText
            }
          : enquiry
      );
      
      setEnquiries(updatedEnquiries);
      setSelectedEnquiry(null);
      setReplyText('');
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'bg-red-100 text-red-800', label: 'New' },
      replied: { color: 'bg-green-100 text-green-800', label: 'Replied' },
      closed: { color: 'bg-gray-100 text-gray-800', label: 'Closed' }
    };
    
    const config = statusConfig[status] || statusConfig.new;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Student Enquiries</h2>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search enquiries..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="replied">Replied</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Enquiries List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {enquiries.map(enquiry => (
          <div key={enquiry._id} className="border-b border-gray-200 last:border-b-0 p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{enquiry.studentName}</h3>
                  <p className="text-sm text-gray-600">{enquiry.studentEmail}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {getStatusBadge(enquiry.status)}
                <span className="text-sm text-gray-500">
                  {new Date(enquiry.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <BookOpen className="w-4 h-4 mr-2" />
                Interested in: {enquiry.course}
              </div>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {enquiry.message}
              </p>
            </div>

            {enquiry.status === 'replied' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center text-sm text-green-800 mb-2">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  <strong>Your Reply:</strong>
                  <span className="text-green-600 ml-2">
                    {new Date(enquiry.repliedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-green-700">{enquiry.replyMessage}</p>
              </div>
            )}

            {enquiry.status === 'new' && (
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedEnquiry(enquiry)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Reply to Enquiry
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Reply to Enquiry</h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                From: {selectedEnquiry.studentName} ({selectedEnquiry.studentEmail})
              </p>
              <p className="text-gray-700">{selectedEnquiry.message}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Reply *
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows="6"
                placeholder="Type your response here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedEnquiry(null);
                  setReplyText('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReply(selectedEnquiry._id)}
                disabled={!replyText.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstituteEnquiries;