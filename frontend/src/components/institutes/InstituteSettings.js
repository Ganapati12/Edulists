import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InstituteLayout from "./InstituteLayout";
import {
  Save,
  Upload,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  Shield,
  Bell,
  CreditCard,
  ArrowLeft,
  Home
} from "lucide-react";

const InstituteSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Get institute data from localStorage
  const getInstituteData = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
      const instituteUser = JSON.parse(localStorage.getItem("institute_user") || "null");
      const institutes = JSON.parse(localStorage.getItem("institutes") || "[]");
      
      const user = currentUser || instituteUser || {};
      const institute = institutes.find(inst => inst.id === user.instituteId || inst.email === user.email) || {};
      
      return { ...user, ...institute };
    } catch (error) {
      console.error("Error getting institute data:", error);
      return {};
    }
  };

  const instituteData = getInstituteData();

  const [formData, setFormData] = useState({
    // Institute Details
    name: instituteData.name || "",
    email: instituteData.email || "",
    phone: instituteData.phone || "",
    address: instituteData.address || "",
    website: instituteData.website || "",
    description: instituteData.description || "",
    contactPerson: instituteData.contactPerson || "",
    
    // Social Media
    facebook: instituteData.facebook || "",
    twitter: instituteData.twitter || "",
    linkedin: instituteData.linkedin || "",
    instagram: instituteData.instagram || "",
    
    // Notification Settings
    emailNotifications: instituteData.emailNotifications !== false,
    studentEnquiries: instituteData.studentEnquiries !== false,
    courseReviews: instituteData.courseReviews !== false,
    marketingEmails: instituteData.marketingEmails || false,
    
    // Security
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Update form data when instituteData changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: instituteData.name || "",
      email: instituteData.email || "",
      phone: instituteData.phone || "",
      address: instituteData.address || "",
      website: instituteData.website || "",
      description: instituteData.description || "",
      contactPerson: instituteData.contactPerson || "",
      facebook: instituteData.facebook || "",
      twitter: instituteData.twitter || "",
      linkedin: instituteData.linkedin || "",
      instagram: instituteData.instagram || "",
    }));
  }, [instituteData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (section) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update localStorage with new data
      const institutes = JSON.parse(localStorage.getItem("institutes") || "[]");
      const updatedInstitutes = institutes.map(inst => 
        inst.id === instituteData.id || inst.email === instituteData.email
          ? { 
              ...inst, 
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              website: formData.website,
              description: formData.description,
              contactPerson: formData.contactPerson,
              facebook: formData.facebook,
              twitter: formData.twitter,
              linkedin: formData.linkedin,
              instagram: formData.instagram,
              emailNotifications: formData.emailNotifications,
              studentEnquiries: formData.studentEnquiries,
              courseReviews: formData.courseReviews,
              marketingEmails: formData.marketingEmails,
              updatedAt: new Date().toISOString() 
            }
          : inst
      );
      localStorage.setItem("institutes", JSON.stringify(updatedInstitutes));
      
      // Update user data in all possible locations
      const updateUserInStorage = (key) => {
        const user = JSON.parse(localStorage.getItem(key) || "null");
        if (user && (user.id === instituteData.id || user.email === instituteData.email)) {
          const updatedUser = { 
            ...user, 
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            website: formData.website,
            description: formData.description,
            contactPerson: formData.contactPerson,
            updatedAt: new Date().toISOString() 
          };
          localStorage.setItem(key, JSON.stringify(updatedUser));
        }
      };

      // Update all user storage locations
      updateUserInStorage("currentUser");
      updateUserInStorage("institute_user");
      updateUserInStorage("user");
      
      alert(`${section} settings saved successfully!`);
    } catch (error) {
      alert(`Error saving ${section} settings: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToDashboard = () => {
    navigate("/institute/dashboard");
  };

  const tabs = [
    { id: "profile", label: "Institute Profile", icon: Building },
    { id: "social", label: "Social Media", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institute Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person *
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+91 1234567890"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institute Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter complete address of your institute"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://yourinstitute.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institute Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your institute, courses, facilities, achievements, etc."
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => handleSave("Profile")}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Profile"}
              </button>
              <button
                onClick={handleNavigateToDashboard}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        );

      case "social":
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Social Media Profiles</h3>
              <p className="text-blue-700 text-sm">
                Add your social media profiles to help students connect with your institute.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook URL
                </label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://facebook.com/yourinstitute"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter URL
                </label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://twitter.com/yourinstitute"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://linkedin.com/company/yourinstitute"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram URL
                </label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://instagram.com/yourinstitute"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => handleSave("Social Media")}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Social Media"}
              </button>
              <button
                onClick={handleNavigateToDashboard}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">Notification Preferences</h3>
              <p className="text-purple-700 text-sm">
                Choose how you want to receive notifications about your institute activities.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive important updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={formData.emailNotifications}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Student Enquiries</h4>
                  <p className="text-sm text-gray-600">Get notified when students send enquiries</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="studentEnquiries"
                    checked={formData.studentEnquiries}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Course Reviews</h4>
                  <p className="text-sm text-gray-600">Notify me when students review courses</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="courseReviews"
                    checked={formData.courseReviews}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Marketing Emails</h4>
                  <p className="text-sm text-gray-600">Receive promotional emails and updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="marketingEmails"
                    checked={formData.marketingEmails}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => handleSave("Notification")}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Preferences"}
              </button>
              <button
                onClick={handleNavigateToDashboard}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Change Password</h3>
              <p className="text-yellow-700 text-sm">
                Ensure your account is using a long, random password to stay secure.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your current password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => handleSave("Security")}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Updating..." : "Update Password"}
              </button>
              <button
                onClick={handleNavigateToDashboard}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-600">This section is under development.</p>
            </div>
            <button
              onClick={handleNavigateToDashboard}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <InstituteLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleNavigateToDashboard}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <button
              onClick={handleNavigateToDashboard}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">Institute Settings</h1>
          <p className="text-gray-600 mt-2">Manage your institute's profile and preferences</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </InstituteLayout>
  );
};

export default InstituteSettings;