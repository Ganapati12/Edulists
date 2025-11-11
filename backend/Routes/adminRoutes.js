import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import the layout component (using the correct default import)
import AdminLayoutFixed from '../components/layouts/AdminLayoutFixed';

// Import all the admin page components
import Dashboard from '../pages/admin/Dashboard';
import InstituteApprovals from '../pages/admin/InstituteApprovals';
import UserManagement from '../pages/admin/UserManagement';
import Analytics from '../pages/admin/Analytics';
import QualityControl from '../pages/admin/QualityControl';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayoutFixed />}>
        {/* Use an index route to redirect /admin to /admin/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        
        {/* Nested routes for each admin page */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="approvals" element={<InstituteApprovals />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="quality-control" element={<QualityControl />} />

        {/* Catch-all route for any other /admin URL */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;