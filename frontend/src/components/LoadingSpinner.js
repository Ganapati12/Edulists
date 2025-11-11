import React from 'react';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 'md', 
  variant = 'default',
  fullScreen = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-b-2',
    lg: 'h-16 w-16 border-b-2',
    xl: 'h-20 w-20 border-b-2'
  };

  const variantClasses = {
    default: 'border-blue-600',
    primary: 'border-blue-600',
    secondary: 'border-gray-600',
    success: 'border-green-600',
    warning: 'border-yellow-600',
    error: 'border-red-600',
    light: 'border-white',
    dark: 'border-gray-800'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const spinnerContent = (
    <div className={`text-center ${className}`}>
      <div 
        className={`animate-spin rounded-full mx-auto mb-4 ${sizeClasses[size]} ${variantClasses[variant]}`}
        role="status"
        aria-label="Loading"
      ></div>
      <p className={`text-gray-600 ${textSizes[size]}`}>{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
        role="alert"
        aria-live="polite"
      >
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;