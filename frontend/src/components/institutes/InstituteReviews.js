import React, { useState, useEffect } from "react";
import InstituteLayout from "./InstituteLayout";
import {
  Star,
  Search,
  Filter,
  ThumbsUp,
  MessageCircle,
  MoreVertical,
  Flag,
  User,
  Calendar,
  Download,
  BarChart3,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

const InstituteReviews = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    positiveReviews: 0,
    pendingReplies: 0,
    flaggedReviews: 0
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockReviews = [
        {
          id: 1,
          studentName: "Rahul Sharma",
          course: "Data Science Bootcamp",
          rating: 5,
          comment: "Excellent course! The instructors were very knowledgeable and the projects were practical.",
          date: "2 days ago",
          createdAt: "2024-01-15T08:30:00Z",
          likes: 12,
          replies: 3,
          studentAvatar: "RS",
          status: "approved",
          reported: false,
          instituteReply: "Thank you for your feedback! We're glad you enjoyed the course."
        },
        {
          id: 2,
          studentName: "Priya Verma",
          course: "Web Development Mastery",
          rating: 4,
          comment: "Good course content but could use more advanced topics. The support team is very responsive.",
          date: "1 week ago",
          createdAt: "2024-01-14T16:45:00Z",
          likes: 8,
          replies: 1,
          studentAvatar: "PV",
          status: "approved",
          reported: false,
          instituteReply: null
        },
        {
          id: 3,
          studentName: "Amit Patel",
          course: "Machine Learning Advanced",
          rating: 5,
          comment: "Outstanding course! The real-world projects helped me land a job as a Machine Learning Engineer.",
          date: "2 weeks ago",
          createdAt: "2024-01-13T12:20:00Z",
          likes: 25,
          replies: 5,
          studentAvatar: "AP",
          status: "approved",
          reported: false,
          instituteReply: "Congratulations on your new role! We're proud of your achievement."
        },
        {
          id: 4,
          studentName: "Anonymous",
          course: "Full Stack Development",
          rating: 1,
          comment: "Very poor management and outdated course material.",
          date: "3 weeks ago",
          createdAt: "2024-01-10T10:15:00Z",
          likes: 2,
          replies: 0,
          studentAvatar: "A",
          status: "flagged",
          reported: true,
          instituteReply: null
        },
        {
          id: 5,
          studentName: "Neha Gupta",
          course: "Data Science Bootcamp",
          rating: 3,
          comment: "Average course. Some modules were good but others need improvement.",
          date: "1 month ago",
          createdAt: "2024-01-05T14:20:00Z",
          likes: 5,
          replies: 2,
          studentAvatar: "NG",
          status: "pending",
          reported: false,
          instituteReply: null
        }
      ];

      setReviews(mockReviews);
      calculateStats(mockReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData) => {
    const totalReviews = reviewsData.length;
    const averageRating = totalReviews > 0 
      ? (reviewsData.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
      : 0;
    const positiveReviews = reviewsData.filter(review => review.rating >= 4).length;
    const pendingReplies = reviewsData.filter(review => !review.instituteReply).length;
    const flaggedReviews = reviewsData.filter(review => review.status === 'flagged').length;

    setStats({
      averageRating,
      totalReviews,
      positiveReviews,
      pendingReplies,
      flaggedReviews
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const handleFlagReview = (reviewId) => {
    if (window.confirm('Are you sure you want to flag this review for moderation?')) {
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, reported: true, status: 'flagged' }
          : review
      ));
      // Recalculate stats after update
      calculateStats(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, reported: true, status: 'flagged' }
          : review
      ));
    }
  };

  const handleApproveReview = (reviewId) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, status: 'approved', reported: false }
        : review
    ));
    calculateStats(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, status: 'approved', reported: false }
        : review
    ));
  };

  const handleReply = (reviewId, reply) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, instituteReply: reply, replies: review.replies + 1 }
        : review
    ));
    calculateStats(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, instituteReply: reply, replies: review.replies + 1 }
        : review
    ));
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = selectedRating === "all" || review.rating === parseInt(selectedRating);
    const matchesStatus = selectedStatus === "all" || review.status === selectedStatus;
    
    return matchesSearch && matchesRating && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
      flagged: { color: "bg-red-100 text-red-800", icon: Shield }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const ReplyForm = ({ review, onSubmit }) => {
    const [reply, setReply] = useState(review.instituteReply || "");
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (reply.trim()) {
        onSubmit(review.id, reply);
        setReply("");
      }
    };

    return (
      <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-50 rounded-lg">
        <label htmlFor={`reply-${review.id}`} className="block text-sm font-medium text-gray-700 mb-2">
          Institute Reply
        </label>
        <textarea
          id={`reply-${review.id}`}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your response here..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="3"
        />
        <div className="flex justify-end space-x-2 mt-2">
          <button
            type="button"
            onClick={() => setReply("")}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            {review.instituteReply ? "Update Reply" : "Post Reply"}
          </button>
        </div>
      </form>
    );
  };

  return (
    <InstituteLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Reviews</h1>
            <p className="text-gray-600 mt-2">Manage and respond to student feedback</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.averageRating}</div>
            <div className="flex justify-center mt-2">
              {renderStars(Math.round(stats.averageRating))}
            </div>
            <p className="text-gray-600 text-sm mt-2">Average Rating</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.totalReviews}</div>
            <p className="text-gray-600 text-sm mt-2">Total Reviews</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.positiveReviews}</div>
            <p className="text-gray-600 text-sm mt-2">Positive Reviews</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.pendingReplies}</div>
            <p className="text-gray-600 text-sm mt-2">Pending Replies</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.flaggedReviews}</div>
            <p className="text-gray-600 text-sm mt-2">Flagged Reviews</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reviews by student, course, or comment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
              <p className="text-gray-500 text-lg">No reviews found matching your criteria.</p>
            </div>
          ) : (
            filteredReviews.map(review => (
              <div key={review.id} className={`bg-white rounded-xl shadow-sm border p-6 ${
                review.status === 'flagged' ? 'border-red-200 bg-red-50' : ''
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {review.studentAvatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{review.studentName}</h3>
                        {getStatusBadge(review.status)}
                      </div>
                      <p className="text-gray-600 text-sm">{review.course}</p>
                      <div className="flex items-center mt-1">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <span className="text-sm text-gray-500">{review.date}</span>
                      <div className="flex space-x-1 mt-1">
                        {review.status !== 'flagged' && !review.reported && (
                          <button 
                            onClick={() => handleFlagReview(review.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Flag review"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                        )}
                        {review.status === 'flagged' && (
                          <button 
                            onClick={() => handleApproveReview(review.id)}
                            className="text-gray-400 hover:text-green-600 transition-colors"
                            title="Approve review"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{review.comment}</p>

                {review.instituteReply && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-2">
                        I
                      </div>
                      <span className="font-semibold text-blue-900">Institute Response</span>
                    </div>
                    <p className="text-blue-800">{review.instituteReply}</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <button className="flex items-center hover:text-blue-600 transition-colors">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {review.likes}
                    </button>
                    <button className="flex items-center hover:text-blue-600 transition-colors">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {review.replies} replies
                    </button>
                  </div>
                  
                  {!review.instituteReply && review.status !== 'flagged' && (
                    <ReplyForm review={review} onSubmit={handleReply} />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </InstituteLayout>
  );
};

export default InstituteReviews;