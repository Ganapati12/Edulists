// src/components/institutes/InstituteProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, MapPin, Phone, Mail, Globe, Upload, Save, X, 
  User, Calendar, Users, Award, Edit, Camera, Image,
  CheckCircle, AlertCircle, Clock, Star, BookOpen
} from 'lucide-react';
import { useInstituteAuth } from './hooks/useInstituteAuth';

const InstituteProfile = () => {
  const { user } = useInstituteAuth();
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadInstituteProfile();
  }, []);

  const loadInstituteProfile = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockInstitute = {
        _id: '1',
        name: user?.instituteName || 'Global Education Institute',
        category: 'university',
        email: user?.email,
        phone: user?.phone,
        website: 'www.globaledu.com',
        establishedYear: 1990,
        accreditation: 'NAAC A+',
        description: 'Premier educational institution offering world-class education with state-of-the-art infrastructure and experienced faculty. We are committed to providing quality education and holistic development to our students.',
        address: {
          street: '123 Education Street',
          city: 'Learning City',
          state: 'Knowledge State',
          country: 'USA',
          zipCode: '12345'
        },
        images: [
          'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
        ],
        facilities: ['Library', 'Sports Complex', 'Hostel', 'Computer Lab', 'Cafeteria', 'Auditorium', 'Laboratories', 'Wi-Fi Campus'],
        totalStudents: 5000,
        facultyCount: 250,
        coursesOffered: 45,
        averageRating: 4.5,
        contactPerson: {
          name: user?.name || 'Dr. Sarah Wilson',
          email: user?.email,
          phone: user?.phone,
          position: 'Director'
        },
        socialMedia: {
          facebook: 'https://facebook.com/globaledu',
          twitter: 'https://twitter.com/globaledu',
          linkedin: 'https://linkedin.com/company/globaledu',
          instagram: 'https://instagram.com/globaledu'
        },
        status: 'approved',
        lastUpdated: '2024-01-15T10:30:00Z'
      };
      
      setInstitute(mockInstitute);
      setFormData(mockInstitute);
    } catch (error) {
      console.error('Error loading institute profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update with new data
      const updatedInstitute = {
        ...formData,
        lastUpdated: new Date().toISOString()
      };
      
      setInstitute(updatedInstitute);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        // In real app, you would upload to server and update formData.images
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
  };

  const addFacility = (facility) => {
    if (facility.trim() && !formData.facilities.includes(facility.trim())) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, facility.trim()]
      });
    }
  };

  const removeFacility = (facility) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter(f => f !== facility)
    });
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Institute Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Institute Profile
              </h1>
              <p className="text-gray-600">
                Manage your institute information and settings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Profile Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={formData.images?.[0] || 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80'}
                    alt="Institute"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {formData.name}
                </h3>
                <p className="text-sm text-gray-600 capitalize">
                  {formData.category}
                </p>
                <div className="flex items-center justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(formData.averageRating) 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {formData.averageRating}
                  </span>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'basic', label: 'Basic Information', icon: Building },
                  { id: 'contact', label: 'Contact Details', icon: User },
                  { id: 'academic', label: 'Academic Info', icon: BookOpen },
                  { id: 'facilities', label: 'Facilities', icon: Award },
                  { id: 'media', label: 'Photos & Media', icon: Image },
                  { id: 'social', label: 'Social Media', icon: Globe }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  Last updated: {new Date(formData.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'basic' && (
                  <BasicInfoTab 
                    formData={formData} 
                    onChange={handleInputChange} 
                  />
                )}

                {activeTab === 'contact' && (
                  <ContactInfoTab 
                    formData={formData} 
                    onChange={handleInputChange} 
                  />
                )}

                {activeTab === 'academic' && (
                  <AcademicInfoTab 
                    formData={formData} 
                    onChange={handleInputChange} 
                  />
                )}

                {activeTab === 'facilities' && (
                  <FacilitiesTab 
                    formData={formData}
                    onAddFacility={addFacility}
                    onRemoveFacility={removeFacility}
                    onChange={handleInputChange}
                  />
                )}

                {activeTab === 'media' && (
                  <MediaTab 
                    formData={formData}
                    imagePreview={imagePreview}
                    onImageUpload={handleImageUpload}
                    onRemoveImage={removeImage}
                  />
                )}

                {activeTab === 'social' && (
                  <SocialMediaTab 
                    formData={formData}
                    onChange={handleInputChange}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => navigate('/institute/dashboard')}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setFormData(institute)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Reset Changes
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab Components
const BasicInfoTab = ({ formData, onChange }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Institute Name *
        </label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter institute name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Institute Type *
        </label>
        <select
          value={formData.category || ''}
          onChange={(e) => onChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="school">School</option>
          <option value="college">College</option>
          <option value="university">University</option>
          <option value="coaching">Coaching Center</option>
          <option value="vocational">Vocational Institute</option>
        </select>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Institute Description *
      </label>
      <textarea
        value={formData.description || ''}
        onChange={(e) => onChange('description', e.target.value)}
        rows="4"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Describe your institute, its mission, vision, and key features..."
      />
      <p className="mt-1 text-sm text-gray-500">
        {formData.description?.length || 0}/500 characters
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Established Year *
        </label>
        <input
          type="number"
          value={formData.establishedYear || ''}
          onChange={(e) => onChange('establishedYear', e.target.value)}
          min="1900"
          max="2024"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Award className="w-4 h-4 inline mr-1" />
          Accreditation
        </label>
        <input
          type="text"
          value={formData.accreditation || ''}
          onChange={(e) => onChange('accreditation', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., NAAC A+, UGC, AICTE"
        />
      </div>
    </div>
  </div>
);

const ContactInfoTab = ({ formData, onChange }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail className="w-4 h-4 inline mr-1" />
          Email Address *
        </label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => onChange('email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone className="w-4 h-4 inline mr-1" />
          Phone Number *
        </label>
        <input
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => onChange('phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Globe className="w-4 h-4 inline mr-1" />
        Website
      </label>
      <input
        type="url"
        value={formData.website || ''}
        onChange={(e) => onChange('website', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="https://example.com"
      />
    </div>

    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Address</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Street Address"
          value={formData.address?.street || ''}
          onChange={(e) => onChange('address.street', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="City"
          value={formData.address?.city || ''}
          onChange={(e) => onChange('address.city', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="State"
          value={formData.address?.state || ''}
          onChange={(e) => onChange('address.state', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="Country"
          value={formData.address?.country || ''}
          onChange={(e) => onChange('address.country', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>

    <div className="border-t pt-6">
      <h4 className="font-medium text-gray-900 mb-4">Contact Person</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Person Name
          </label>
          <input
            type="text"
            value={formData.contactPerson?.name || ''}
            onChange={(e) => onChange('contactPerson.name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position
          </label>
          <input
            type="text"
            value={formData.contactPerson?.position || ''}
            onChange={(e) => onChange('contactPerson.position', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  </div>
);

const AcademicInfoTab = ({ formData, onChange }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Users className="w-4 h-4 inline mr-1" />
          Total Students
        </label>
        <input
          type="number"
          value={formData.totalStudents || ''}
          onChange={(e) => onChange('totalStudents', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <User className="w-4 h-4 inline mr-1" />
          Faculty Count
        </label>
        <input
          type="number"
          value={formData.facultyCount || ''}
          onChange={(e) => onChange('facultyCount', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <BookOpen className="w-4 h-4 inline mr-1" />
          Courses Offered
        </label>
        <input
          type="number"
          value={formData.coursesOffered || ''}
          onChange={(e) => onChange('coursesOffered', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Student-Teacher Ratio
      </label>
      <input
        type="text"
        value={formData.totalStudents && formData.facultyCount 
          ? Math.round(formData.totalStudents / formData.facultyCount) + ':1'
          : ''
        }
        readOnly
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
        placeholder="Auto-calculated"
      />
    </div>
  </div>
);

const FacilitiesTab = ({ formData, onAddFacility, onRemoveFacility, onChange }) => {
  const [newFacility, setNewFacility] = useState('');

  const handleAddFacility = () => {
    if (newFacility.trim()) {
      onAddFacility(newFacility);
      setNewFacility('');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Institute Facilities</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Facilities
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {formData.facilities?.map((facility, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {facility}
              <button
                type="button"
                onClick={() => onRemoveFacility(facility)}
                className="ml-2 hover:text-blue-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {formData.facilities?.length === 0 && (
            <p className="text-gray-500 text-sm">No facilities added yet.</p>
          )}
        </div>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={newFacility}
            onChange={(e) => setNewFacility(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddFacility()}
            placeholder="Add a facility (e.g., Swimming Pool)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleAddFacility}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

const MediaTab = ({ formData, imagePreview, onImageUpload, onRemoveImage }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos & Media</h3>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-4">
        Institute Images
      </label>
      
      {/* Image Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">Upload institute photos</p>
        <p className="text-xs text-gray-500 mb-4">Recommended: 1200x800px, JPG/PNG format</p>
        <input
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
        >
          Choose Files
        </label>
      </div>

      {/* Image Preview Grid */}
      {imagePreview && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">New Image Preview</h4>
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Existing Images */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {formData.images?.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Institute ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              onClick={() => onRemoveImage(index)}
              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
            {index === 0 && (
              <span className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                Main
              </span>
            )}
          </div>
        ))}
      </div>
      
      {formData.images?.length === 0 && (
        <div className="text-center py-8">
          <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No images uploaded yet.</p>
        </div>
      )}
    </div>
  </div>
);

const SocialMediaTab = ({ formData, onChange }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h3>
    
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Facebook
        </label>
        <input
          type="url"
          value={formData.socialMedia?.facebook || ''}
          onChange={(e) => onChange('socialMedia.facebook', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://facebook.com/your-institute"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Twitter
        </label>
        <input
          type="url"
          value={formData.socialMedia?.twitter || ''}
          onChange={(e) => onChange('socialMedia.twitter', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://twitter.com/your-institute"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          LinkedIn
        </label>
        <input
          type="url"
          value={formData.socialMedia?.linkedin || ''}
          onChange={(e) => onChange('socialMedia.linkedin', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://linkedin.com/company/your-institute"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instagram
        </label>
        <input
          type="url"
          value={formData.socialMedia?.instagram || ''}
          onChange={(e) => onChange('socialMedia.instagram', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://instagram.com/your-institute"
        />
      </div>
    </div>
  </div>
);

export default InstituteProfile;