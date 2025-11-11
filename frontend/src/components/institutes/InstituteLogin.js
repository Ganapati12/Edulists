// src/components/institutes/InstituteLogin.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useInstituteAuth } from '../../contexts/InstituteAuthContext';

const InstituteLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { login, error, clearError, user } = useInstituteAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated as institute
  useEffect(() => {
    if (user && user.role === 'institute') {
      const from = location.state?.from?.pathname || '/institute/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  useEffect(() => {
    clearError();
    setLoginError('');
  }, [formData.email, formData.password, clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    clearError();

    try {
      console.log('🔐 Institute login attempt:', { email: formData.email });
      
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        console.log('✅ Institute login successful, redirecting...');
        
        // Check approval status and redirect accordingly
        if (result.user.status === 'approved') {
          navigate('/institute/dashboard', { 
            replace: true,
            state: { message: `Welcome back, ${result.user.name}!` }
          });
        } else if (result.user.status === 'pending') {
          navigate('/institute/pending-approval', { replace: true });
        } else {
          setLoginError('Your institute account has been rejected. Please contact support.');
        }
      } else {
        setLoginError(result.message || 'Login failed');
        console.log('❌ Institute login failed:', result.message);
      }
    } catch (err) {
      console.error('Institute login error:', err);
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'contact@harvarduniversity.edu',
      password: 'institute123'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              EduList
            </h1>
          </Link>
          <div className="mt-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
              <span className="text-3xl">🏫</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Institute Portal
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Manage your educational institution
            </p>
          </div>
        </div>

        {/* Demo Login Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full bg-blue-50 text-blue-700 py-3 px-4 rounded-lg text-sm font-medium border border-blue-200 hover:bg-blue-100 transition-colors mb-4"
          >
            🚀 Try Demo Institute Account
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error Message */}
          {(error || loginError) && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error || loginError}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Institute Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter your institute email"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="text-gray-400 hover:text-gray-600">
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </>
            ) : (
              'Sign in to Institute Portal'
            )}
          </button>

          {/* Registration Links */}
          <div className="text-center space-y-3">
            <div className="text-sm">
              <span className="text-gray-600">
                Don't have an institute account?
              </span>
              {' '}
              <Link
                to="/institute/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Register your institute
              </Link>
            </div>

            {/* Switch to Other Portals */}
            <div className="text-xs text-gray-500 border-t pt-3">
              <p>
                Looking for other portals?{' '}
                <Link
                  to="/admin/login"
                  className="text-blue-500 hover:text-blue-700 underline mr-3"
                >
                  Admin Portal
                </Link>
                <Link
                  to="/user/login"
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  Student Portal
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstituteLogin;