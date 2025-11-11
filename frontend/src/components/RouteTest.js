// src/components/RouteTest.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const RouteTest = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Route Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Public Routes</h2>
            <div className="space-y-2">
              <Link to="/" className="block text-blue-600 hover:underline">/ (Landing Page)</Link>
              <Link to="/home" className="block text-blue-600 hover:underline">/home (Home Page)</Link>
              <Link to="/about" className="block text-blue-600 hover:underline">/about (About Page)</Link>
              <Link to="/contact" className="block text-blue-600 hover:underline">/contact (Contact Page)</Link>
              <Link to="/institutes" className="block text-blue-600 hover:underline">/institutes (Institute List)</Link>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Auth Routes</h2>
            <div className="space-y-2">
              <Link to="/user/login" className="block text-blue-600 hover:underline">/user/login</Link>
              <Link to="/user/register" className="block text-blue-600 hover:underline">/user/register</Link>
              <Link to="/institute/login" className="block text-blue-600 hover:underline">/institute/login</Link>
              <Link to="/institute/register" className="block text-blue-600 hover:underline">/institute/register</Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Route Info</h2>
          <p><strong>Window Location:</strong> {window.location.href}</p>
          <p><strong>Pathname:</strong> {window.location.pathname}</p>
        </div>
      </div>
    </div>
  );
};

export default RouteTest;