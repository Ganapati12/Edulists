import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Phone, Mail, Globe, Star, Users, BookOpen, 
  Calendar, Award, Clock, Building, ArrowLeft, Share,
  Heart, MessageCircle, Eye, CheckCircle, TrendingUp,
  Image as ImageIcon, Edit, Trash2, Save, X, Plus
} from 'lucide-react';

// Dynamic Institute Detail Component
const InstituteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEditMode, setIsEditMode] = useState(id === 'new');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Default structure for a new institute
  const defaultInstitute = {
    _id: '',
    name: 'New Institute',
    category: 'college',
    email: '',
    phone: '',
    website: '',
    establishedYear: new Date().getFullYear(),
    accreditation: '',
    description: '',
    longDescription: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    images: [],
    facilities: [],
    stats: {
      totalStudents: 0,
      facultyCount: 0,
      coursesOffered: 0,
      placementRate: 0,
      averageRating: 0,
      totalReviews: 0
    },
    courses: [],
    reviews: [],
    contactPerson: {
      name: '',
      position: '',
      email: '',
      phone: ''
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: ''
    }
  };

  // Get all institutes from localStorage
  const getAllInstitutes = () => {
    try {
      const savedInstitutes = localStorage.getItem('institutes');
      return savedInstitutes ? JSON.parse(savedInstitutes) : {};
    } catch (error) {
      console.error('Error loading institutes from localStorage:', error);
      return {};
    }
  };

  // Save all institutes to localStorage
  const saveAllInstitutes = (institutes) => {
    try {
      localStorage.setItem('institutes', JSON.stringify(institutes));
      return true;
    } catch (error) {
      console.error('Error saving institutes to localStorage:', error);
      return false;
    }
  };

  // Generate sample data for new institutes
  const generateSampleData = (instituteId) => {
    const categories = ['university', 'college', 'medical college', 'engineering college', 'arts college', 'law college'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];
    const states = ['California', 'New York', 'Texas', 'Florida', 'Illinois', 'Washington'];
    
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomState = states[Math.floor(Math.random() * states.length)];

    return {
      _id: instituteId,
      name: `${randomCategory.charAt(0).toUpperCase() + randomCategory.slice(1)} of ${randomCity}`,
      category: randomCategory,
      email: `info@institute${instituteId}.edu`,
      phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      website: `www.institute${instituteId}.edu`,
      establishedYear: Math.floor(1950 + Math.random() * 70),
      accreditation: 'NAAC A++, UGC Approved',
      description: `A premier ${randomCategory} located in ${randomCity}, ${randomState} offering world-class education with state-of-the-art facilities.`,
      longDescription: `Founded in ${Math.floor(1950 + Math.random() * 70)}, this institution has been at the forefront of education for decades. We provide comprehensive programs, experienced faculty, and modern infrastructure to prepare students for successful careers. Our campus in ${randomCity}, ${randomState} offers a vibrant learning environment with numerous opportunities for growth and development.`,
      address: {
        street: `${Math.floor(100 + Math.random() * 900)} Education Avenue`,
        city: randomCity,
        state: randomState,
        country: 'USA',
        zipCode: Math.floor(10000 + Math.random() * 90000).toString()
      },
      images: [
        'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      ],
      facilities: [
        'Library with 50,000+ books',
        'Advanced Computer Labs',
        'Sports Complex',
        'Hostel Accommodation',
        'Research Center',
        'Auditorium',
        'Cafeteria',
        'Medical Center'
      ],
      stats: {
        totalStudents: Math.floor(1000 + Math.random() * 10000),
        facultyCount: Math.floor(50 + Math.random() * 500),
        coursesOffered: Math.floor(10 + Math.random() * 50),
        placementRate: Math.floor(70 + Math.random() * 30),
        averageRating: (3.5 + Math.random() * 1.5).toFixed(1),
        totalReviews: Math.floor(50 + Math.random() * 300)
      },
      courses: [
        {
          _id: `course_${Date.now()}_1`,
          name: `${randomCategory === 'engineering college' ? 'Computer Science Engineering' : 
                 randomCategory === 'medical college' ? 'Medical Sciences' :
                 randomCategory === 'law college' ? 'Law Degree' : 'Bachelor of Arts'}`,
          duration: '4 years',
          fees: Math.floor(50000 + Math.random() * 50000),
          seats: Math.floor(60 + Math.random() * 140),
          eligibility: '10+2 with minimum 60% marks'
        },
        {
          _id: `course_${Date.now()}_2`,
          name: `${randomCategory === 'engineering college' ? 'Electrical Engineering' : 
                 randomCategory === 'medical college' ? 'Dental Surgery' :
                 randomCategory === 'law college' ? 'Corporate Law' : 'Master of Business Administration'}`,
          duration: randomCategory === 'medical college' ? '5 years' : '2 years',
          fees: Math.floor(40000 + Math.random() * 60000),
          seats: Math.floor(40 + Math.random() * 80),
          eligibility: randomCategory === 'medical college' ? '10+2 with PCB and 70% marks' : 'Graduation with 55% marks'
        }
      ],
      reviews: [],
      contactPerson: {
        name: 'Dr. Sarah Wilson',
        position: 'Admission Head',
        email: `admissions@institute${instituteId}.edu`,
        phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`
      },
      socialMedia: {
        facebook: `https://facebook.com/institute${instituteId}`,
        twitter: `https://twitter.com/institute${instituteId}`,
        linkedin: `https://linkedin.com/school/institute${instituteId}`,
        instagram: `https://instagram.com/institute${instituteId}`
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  useEffect(() => {
    loadInstituteDetail();
  }, [id]);

  const loadInstituteDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (id === 'new') {
        setInstitute(defaultInstitute);
        setIsEditMode(true);
      } else {
        const allInstitutes = getAllInstitutes();
        let instituteData = allInstitutes[id];
        
        // If institute not found, create sample data for demonstration
        if (!instituteData) {
          instituteData = generateSampleData(id);
          // Save the generated institute
          allInstitutes[id] = instituteData;
          saveAllInstitutes(allInstitutes);
        }
        
        if (instituteData) {
          // Ensure all required fields are present
          const mergedInstitute = {
            ...defaultInstitute,
            ...instituteData,
            stats: {
              ...defaultInstitute.stats,
              ...(instituteData.stats || {})
            },
            address: {
              ...defaultInstitute.address,
              ...(instituteData.address || {})
            },
            images: instituteData.images || [],
            facilities: instituteData.facilities || [],
            courses: instituteData.courses || [],
            reviews: instituteData.reviews || []
          };
          setInstitute(mergedInstitute);
        } else {
          setError('Institute not found');
        }
      }
    } catch (err) {
      console.error('Error loading institute details:', err);
      setError('Failed to load institute details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInstitute = async () => {
    try {
      if (!institute.name.trim()) {
        alert('Institute name is required');
        return;
      }

      const instituteId = institute._id || `institute_${Date.now()}`;
      const instituteToSave = {
        ...institute,
        _id: instituteId,
        updatedAt: new Date().toISOString(),
        createdAt: institute.createdAt || new Date().toISOString()
      };

      // Save to localStorage
      const allInstitutes = getAllInstitutes();
      allInstitutes[instituteId] = instituteToSave;
      const success = saveAllInstitutes(allInstitutes);

      if (success) {
        alert('Institute saved successfully!');
        if (id === 'new') {
          navigate(`/institutes/${instituteId}`);
        } else {
          setIsEditMode(false);
          setInstitute(instituteToSave);
        }
      } else {
        throw new Error('Failed to save to localStorage');
      }
    } catch (err) {
      console.error('Error saving institute:', err);
      alert('Failed to save institute. Please try again.');
    }
  };

  const handleDeleteInstitute = async () => {
    try {
      const allInstitutes = getAllInstitutes();
      delete allInstitutes[id];
      const success = saveAllInstitutes(allInstitutes);
      
      if (success) {
        alert('Institute deleted successfully!');
        navigate('/institutes');
      } else {
        throw new Error('Failed to delete from localStorage');
      }
    } catch (err) {
      console.error('Error deleting institute:', err);
      alert('Failed to delete institute. Please try again.');
    }
  };

  const handleAddImage = (imageUrl) => {
    if (imageUrl.trim()) {
      setInstitute(prev => ({
        ...prev,
        images: [...(prev.images || []), imageUrl]
      }));
    }
  };

  const handleRemoveImage = (index) => {
    setInstitute(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddFacility = (facility) => {
    if (facility.trim()) {
      setInstitute(prev => ({
        ...prev,
        facilities: [...(prev.facilities || []), facility]
      }));
    }
  };

  const handleRemoveFacility = (index) => {
    setInstitute(prev => ({
      ...prev,
      facilities: (prev.facilities || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddCourse = (course) => {
    const newCourse = {
      _id: `course_${Date.now()}`,
      ...course
    };
    setInstitute(prev => ({
      ...prev,
      courses: [...(prev.courses || []), newCourse]
    }));
  };

  const handleUpdateCourse = (courseId, updatedCourse) => {
    setInstitute(prev => ({
      ...prev,
      courses: (prev.courses || []).map(course => 
        course._id === courseId ? { ...course, ...updatedCourse } : course
      )
    }));
  };

  const handleRemoveCourse = (courseId) => {
    setInstitute(prev => ({
      ...prev,
      courses: (prev.courses || []).filter(course => course._id !== courseId)
    }));
  };

  const handleSendEnquiry = () => {
    if (institute?.email) {
      window.location.href = `mailto:${institute.email}?subject=Enquiry about ${institute.name}&body=Hello, I would like to get more information about your institute.`;
    } else {
      alert('Email address not available for this institute.');
    }
  };

  const handleShareInstitute = () => {
    if (navigator.share) {
      navigator.share({
        title: institute?.name || 'Institute',
        text: `Check out ${institute?.name || 'this institute'} on EduList`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const toggleFavorite = () => {
    // Save to localStorage for persistence
    const favorites = JSON.parse(localStorage.getItem('favoriteInstitutes') || '[]');
    if (isFavorite) {
      const updatedFavorites = favorites.filter(favId => favId !== id);
      localStorage.setItem('favoriteInstitutes', JSON.stringify(updatedFavorites));
    } else {
      favorites.push(id);
      localStorage.setItem('favoriteInstitutes', JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
  };

  // Check if institute is favorite on component load
  useEffect(() => {
    if (id && id !== 'new') {
      const favorites = JSON.parse(localStorage.getItem('favoriteInstitutes') || '[]');
      setIsFavorite(favorites.includes(id));
    }
  }, [id]);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const renderStars = (rating) => {
    const numericRating = typeof rating === 'string' ? parseFloat(rating) : Number(rating);
    
    if (isNaN(numericRating)) {
      return (
        <div className="flex items-center">
          <span className="text-sm text-gray-500">No ratings</span>
        </div>
      );
    }

    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(numericRating) 
                ? 'text-yellow-500 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{numericRating.toFixed(1)}</span>
      </div>
    );
  };

  // Edit Form Components
  const EditField = ({ label, value, onChange, type = 'text', placeholder = '', required = false }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={required}
      />
    </div>
  );

  const ImageManager = () => {
    const [newImageUrl, setNewImageUrl] = useState('');

    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Institute Images
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Add image URL"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newImageUrl.trim()) {
                handleAddImage(newImageUrl);
                setNewImageUrl('');
              }
            }}
          />
          <button
            onClick={() => {
              if (newImageUrl.trim()) {
                handleAddImage(newImageUrl);
                setNewImageUrl('');
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(institute?.images || []).map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Institute ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
                }}
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(institute?.images || []).length === 0 && (
            <div className="col-span-3 text-center py-8 text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No images added yet</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const FacilityManager = () => {
    const [newFacility, setNewFacility] = useState('');

    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Facilities
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newFacility}
            onChange={(e) => setNewFacility(e.target.value)}
            placeholder="Add facility"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newFacility.trim()) {
                handleAddFacility(newFacility);
                setNewFacility('');
              }
            }}
          />
          <button
            onClick={() => {
              if (newFacility.trim()) {
                handleAddFacility(newFacility);
                setNewFacility('');
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {(institute?.facilities || []).map((facility, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <span>{facility}</span>
              <button
                onClick={() => handleRemoveFacility(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CourseManager = () => {
    const [editingCourse, setEditingCourse] = useState(null);
    const [courseForm, setCourseForm] = useState({
      name: '',
      duration: '',
      fees: '',
      seats: '',
      eligibility: ''
    });

    const handleSaveCourse = () => {
      if (!courseForm.name.trim()) {
        alert('Course name is required');
        return;
      }

      if (editingCourse) {
        handleUpdateCourse(editingCourse, courseForm);
      } else {
        handleAddCourse(courseForm);
      }
      setCourseForm({ name: '', duration: '', fees: '', seats: '', eligibility: '' });
      setEditingCourse(null);
    };

    const handleEditCourse = (course) => {
      setEditingCourse(course._id);
      setCourseForm(course);
    };

    const handleCancelEdit = () => {
      setEditingCourse(null);
      setCourseForm({ name: '', duration: '', fees: '', seats: '', eligibility: '' });
    };

    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Courses
        </label>
        
        {/* Course Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Course Name *"
            value={courseForm.name}
            onChange={(e) => setCourseForm(prev => ({ ...prev, name: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Duration"
            value={courseForm.duration}
            onChange={(e) => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Fees"
            value={courseForm.fees}
            onChange={(e) => setCourseForm(prev => ({ ...prev, fees: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Seats"
            value={courseForm.seats}
            onChange={(e) => setCourseForm(prev => ({ ...prev, seats: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Eligibility"
            value={courseForm.eligibility}
            onChange={(e) => setCourseForm(prev => ({ ...prev, eligibility: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
          />
        </div>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleSaveCourse}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {editingCourse ? 'Update Course' : 'Add Course'}
          </button>
          {editingCourse && (
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Courses List */}
        <div className="space-y-3">
          {(institute?.courses || []).map((course) => (
            <div key={course._id} className="flex items-center justify-between bg-gray-50 p-4 rounded">
              <div className="flex-1">
                <h4 className="font-semibold">{course.name}</h4>
                <p className="text-sm text-gray-600">
                  {course.duration} • ₹{course.fees} • {course.seats} seats
                </p>
                {course.eligibility && (
                  <p className="text-sm text-gray-500 mt-1">Eligibility: {course.eligibility}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditCourse(course)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit course"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveCourse(course._id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {(institute?.courses || []).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No courses added yet</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Institute Details...</p>
        </div>
      </div>
    );
  }

  if (error || !institute) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-gray-400 text-6xl mb-4">🏫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Institute Not Found</h2>
          <p className="text-gray-600 mb-6">
            The institute you're looking for doesn't exist or may have been removed.
          </p>
          <div className="space-x-4">
            <button 
              onClick={() => navigate('/institutes')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Institutes
            </button>
            <button 
              onClick={() => navigate('/institutes/new')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add New Institute
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safe data access for view mode
  const safeInstitute = {
    ...defaultInstitute,
    ...institute,
    stats: {
      ...defaultInstitute.stats,
      ...(institute.stats || {})
    },
    address: {
      ...defaultInstitute.address,
      ...(institute.address || {})
    },
    images: institute.images || [],
    facilities: institute.facilities || [],
    courses: institute.courses || []
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate('/institutes')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Institutes
            </button>
            <div className="flex space-x-3">
              {isEditMode ? (
                <>
                  <button
                    onClick={toggleEditMode}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveInstitute}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Institute
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleShareInstitute}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  <button
                    onClick={toggleFavorite}
                    className={`flex items-center px-4 py-2 border rounded-lg ${
                      isFavorite 
                        ? 'bg-red-50 border-red-200 text-red-600' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={toggleEditMode}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Institute
                  </button>
                  {id !== 'new' && (
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Keep the same view/edit mode structure as before */}
      {/* ... (Rest of the component remains exactly the same as in the previous working version) */}
    </div>
  );
};

export default InstituteDetail;