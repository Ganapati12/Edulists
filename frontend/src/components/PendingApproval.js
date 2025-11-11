// src/pages/UserPendingApproval.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Mail, 
  User, 
  CheckCircle, 
  AlertCircle, 
  LogOut, 
  RefreshCw, 
  ExternalLink,
  Home,
  Building,
  MapPin,
  Phone
} from 'lucide-react';

export default function UserPendingApproval() {
  const { user, checkApprovalStatus, logout } = useAuth();
  const navigate = useNavigate();
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [lastChecked, setLastChecked] = useState(null);
  const [error, setError] = useState(null);
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);
  const [registrationTime, setRegistrationTime] = useState(null);

  useEffect(() => {
    console.log('Checking authentication status on mount...');
    
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/user/login', { replace: true });
      return;
    }

    console.log('User status:', user.status);
    
    if (user.status === 'approved') {
      console.log('User already approved, redirecting to dashboard');
      navigate('/user/dashboard', { 
        replace: true,
        state: { 
          message: 'Your account has been approved! Welcome to your dashboard.' 
        } 
      });
      return;
    }

    if (user.status === 'rejected') {
      console.log('User rejected, showing rejection message');
      setStatusMessage('Your account has been rejected. Please contact support for more information.');
      return;
    }

    // Set registration time for demo auto-approval
    const savedRegistrationTime = localStorage.getItem('userRegistrationTime');
    if (savedRegistrationTime) {
      setRegistrationTime(parseInt(savedRegistrationTime));
      console.log('Registration time:', new Date(parseInt(savedRegistrationTime)).toLocaleString());
    } else {
      // Set registration time if not exists
      const newRegistrationTime = new Date().getTime();
      localStorage.setItem('userRegistrationTime', newRegistrationTime.toString());
      setRegistrationTime(newRegistrationTime);
    }

    // Start checking approval status periodically
    checkApprovalStatusPeriodically();
  }, [user, navigate]);

  // Check for demo auto-approval
  useEffect(() => {
    if (registrationTime && user && user.status === 'pending') {
      const checkDemoApproval = () => {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - registrationTime;
        const timeLeft = 120000 - timeDiff; // 2 minutes in milliseconds
        
        console.log(`Demo approval check - Time passed: ${Math.round(timeDiff/1000)}s, Time left: ${Math.round(timeLeft/1000)}s`);
        
        if (timeDiff > 120000) {
          console.log('Demo auto-approval time reached!');
          handleDemoApproval();
        }
      };

      // Check immediately
      checkDemoApproval();
      
      // Set up interval to check every 10 seconds
      const interval = setInterval(checkDemoApproval, 10000);
      
      return () => clearInterval(interval);
    }
  }, [registrationTime, user]);

  // Auto-check and countdown timers
  useEffect(() => {
    let interval;
    let countdownInterval;

    if (user && user.status === 'pending' && autoCheckEnabled) {
      console.log('Starting auto-check intervals for user:', user.id);

      // Auto-check for approval status every 30 seconds
      interval = setInterval(() => {
        console.log('Auto-check triggered');
        checkApprovalStatusPeriodically();
      }, 30000);

      // Countdown timer for UI
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      console.log('Cleaning up intervals');
      if (interval) clearInterval(interval);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [user, autoCheckEnabled]);

  const checkApprovalStatusPeriodically = async () => {
    setCheckingStatus(true);
    setStatusMessage('Checking your approval status...');

    try {
      const isApproved = await checkApprovalStatus();
      const checkedTime = new Date().toLocaleTimeString();
      setLastChecked(checkedTime);
      
      console.log('Approval status result:', isApproved);
      
      if (isApproved) {
        setStatusMessage('🎉 Your account has been approved! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/user/dashboard', { 
            replace: true,
            state: { 
              message: 'Your account has been approved! Welcome to your dashboard.' 
            } 
          });
        }, 2000);
      } else {
        setStatusMessage('⏳ Your account is still pending approval. Please wait while we process your registration.');
        
        // Continue checking every 30 seconds if auto-check is enabled
        if (autoCheckEnabled) {
          setTimeout(checkApprovalStatusPeriodically, 30000);
        }
      }
    } catch (error) {
      console.error('Error checking approval status:', error);
      setError('❌ Error checking approval status. Please check your internet connection and try again.');
      setStatusMessage('❌ Error checking approval status. Please try refreshing the page.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleDemoApproval = async () => {
    try {
      console.log('Processing demo auto-approval...');
      
      // Update user status to approved
      const updatedUser = { 
        ...user, 
        status: 'approved',
        approvedAt: new Date().toISOString()
      };
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('Demo approval completed, redirecting to dashboard...');
      
      // Redirect to dashboard
      navigate('/user/dashboard', { 
        replace: true,
        state: { 
          message: 'Your account has been approved! Welcome to your dashboard.' 
        } 
      });
    } catch (error) {
      console.error('Error in demo approval:', error);
      setError('Failed to process auto-approval. Please try manual check.');
    }
  };

  const handleManualCheck = async () => {
    console.log('Manual check requested');
    await checkApprovalStatusPeriodically();
    setCountdown(30); // Reset countdown after manual check
  };

  const handleLogout = () => {
    console.log('Logging out user');
    if (window.confirm('Are you sure you want to log out? Your approval status will continue to be processed.')) {
      logout();
      navigate('/user/login', { replace: true });
    }
  };

  const handleContactSupport = () => {
    const subject = `Account Approval Inquiry - ${user?.name || user?.email}`;
    const body = `Hello Support Team,\n\nI would like to inquire about the approval status for my account.\n\nAccount Details:\n- Name: ${user?.name}\n- Email: ${user?.email}\n- Registered: ${new Date().toLocaleDateString()}\n\nCould you please provide an update on the approval process?\n\nThank you.\n\nBest regards,\n${user?.name}`;
    
    window.location.href = `mailto:support@edulist.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const toggleAutoCheck = () => {
    setAutoCheckEnabled(!autoCheckEnabled);
    if (!autoCheckEnabled) {
      setCountdown(30);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  // Calculate demo time left
  const getDemoTimeLeft = () => {
    if (!registrationTime) return null;
    
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - registrationTime;
    const timeLeft = Math.max(0, 120000 - timeDiff); // 2 minutes
    
    return {
      minutes: Math.floor(timeLeft / 60000),
      seconds: Math.floor((timeLeft % 60000) / 1000)
    };
  };

  const demoTimeLeft = getDemoTimeLeft();

  // Debug information component for development
  const DebugInfo = () => {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            Debug Information
          </h3>
          <div className="text-xs text-yellow-700 space-y-1">
            <p><strong>User Status:</strong> {user?.status}</p>
            <p><strong>User ID:</strong> {user?.id}</p>
            <p><strong>User Email:</strong> {user?.email}</p>
            <p><strong>Auto-check:</strong> {autoCheckEnabled ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Last Checked:</strong> {lastChecked || 'Never'}</p>
            <p><strong>Registration Time:</strong> {registrationTime ? new Date(registrationTime).toLocaleTimeString() : 'Not set'}</p>
            <p><strong>Demo Time Left:</strong> {demoTimeLeft ? `${demoTimeLeft.minutes}m ${demoTimeLeft.seconds}s` : 'N/A'}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleRefreshPage}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  console.log('Current user:', user);
                  console.log('LocalStorage user:', localStorage.getItem('user'));
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                Log State
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your information...</p>
          <button
            onClick={handleRefreshPage}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 text-sm font-medium">Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center border border-gray-200 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center animate-pulse">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-xs text-white font-bold">!</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Approval Pending
          </h1>
          <p className="text-gray-600 mb-4">
            Thank you for registering <strong className="text-blue-600">{user.name || user.email}</strong>!
          </p>
          
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-sm font-medium animate-pulse">
            <AlertCircle className="w-4 h-4 mr-1" />
            Under Review
          </div>

          {/* Status Message */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              {statusMessage}
            </p>
          </div>

          {/* Demo Timer */}
          {demoTimeLeft && demoTimeLeft.minutes >= 0 && user.status === 'pending' && (
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-purple-800 text-sm">
                <strong>Demo Auto-approval:</strong> {demoTimeLeft.minutes}m {demoTimeLeft.seconds}s
              </p>
              <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.max(0, 100 - ((demoTimeLeft.minutes * 60 + demoTimeLeft.seconds) / 120 * 100))}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* User Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Account Details
          </h2>
          
          <div className="space-y-3">
            {user.name && (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <User className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium text-gray-900 truncate">{user.name}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Mail className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-600">Email Address</p>
                <p className="font-medium text-gray-900 truncate">{user.email}</p>
              </div>
            </div>
            
            {user.phone && (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Phone className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium text-gray-900">{user.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Information Cards */}
        <div className="grid gap-4 md:grid-cols-2 animate-fade-in">
          {/* Review Process */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start mb-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mr-3 flex-shrink-0 mt-0.5" />
              <h3 className="font-semibold text-orange-800">Application Under Review</h3>
            </div>
            <ul className="text-orange-700 text-sm space-y-2">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2 mt-1">•</span>
                <span>Our team is verifying your account details</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2 mt-1">•</span>
                <span>Process typically takes 24-48 hours</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2 mt-1">•</span>
                <span>We'll contact you if more information is needed</span>
              </li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start mb-3">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <h3 className="font-semibold text-green-800">What's Next?</h3>
            </div>
            <ul className="text-green-700 text-sm space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">•</span>
                <span>You'll receive an email notification</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">•</span>
                <span>Automatic redirect to dashboard</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">•</span>
                <span>Full access to all features</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Auto-refresh Status */}
        {user.status === 'pending' && (
          <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-200 animate-fade-in">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <RefreshCw className={`w-5 h-5 mr-2 ${checkingStatus ? 'animate-spin text-blue-600' : 'text-gray-500'}`} />
                <span className="text-sm font-medium text-gray-700">
                  {checkingStatus ? 'Checking approval status...' : 'Auto-checking status'}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {autoCheckEnabled ? (
                    <>Next check in <span className="font-bold text-blue-600">{countdown}</span> seconds</>
                  ) : (
                    <span className="text-orange-600">Auto-check disabled</span>
                  )}
                </p>
                {lastChecked && (
                  <p className="text-xs text-gray-500">
                    Last checked: {lastChecked}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleManualCheck}
                  disabled={checkingStatus}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${checkingStatus ? 'animate-spin' : ''}`} />
                  {checkingStatus ? 'Checking...' : 'Check Now'}
                </button>
                
                <button
                  onClick={toggleAutoCheck}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    autoCheckEnabled 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                  title={autoCheckEnabled ? 'Disable auto-check' : 'Enable auto-check'}
                >
                  {autoCheckEnabled ? 'Pause' : 'Resume'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid gap-3 sm:grid-cols-2 animate-fade-in">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors hover:border-gray-400"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
          
          <button
            onClick={handleContactSupport}
            className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Contact Support
          </button>
        </div>

        {/* Additional Options */}
        <div className="text-center animate-fade-in">
          <button
            onClick={handleGoHome}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            Back to Homepage
          </button>
        </div>

        {/* Demo Information */}
        {user.status === 'pending' && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center animate-fade-in">
            <p className="text-purple-800 text-sm">
              <strong>Demo Note:</strong> For demonstration purposes, your account will be automatically approved within 2 minutes
            </p>
            {demoTimeLeft && (
              <p className="text-purple-700 text-xs mt-1">
                Time until auto-approval: {demoTimeLeft.minutes}m {demoTimeLeft.seconds}s
              </p>
            )}
          </div>
        )}

        {/* Rejection Information */}
        {user.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 animate-fade-in">
            <div className="flex items-start mb-3">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <h3 className="font-semibold text-red-800">Account Rejected</h3>
            </div>
            <p className="text-red-700 text-sm mb-3">
              Unfortunately, your account registration has been rejected. 
              This could be due to incomplete information or not meeting our requirements.
            </p>
            <p className="text-red-700 text-sm">
              Please contact our support team for more information or consider registering again with complete information.
            </p>
          </div>
        )}

        {/* Debug Information */}
        <DebugInfo />
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}