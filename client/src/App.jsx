import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import ProtectedRoute from './Components/ProtectedRoute';
import AppLayout from './Components/AppLayout';

// Pages
import Home from './Pages/Home';
import Login from './Pages/Login';
import Register from './Pages/Register';
import CitizenDashboard from './Pages/CitizenDashboard';
import SubmitComplaint from './Pages/SubmitComplaint';
import EditComplaint from './Pages/EditComplaint';
import ComplaintDetails from './Pages/ComplaintDetails';
import Profile from './Pages/Profile';
import OfficerDashboard from './Pages/OfficerDashboard';
import AdminDashboard from './Pages/AdminDashboard';
import AdminUsers from './Pages/AdminUsers';
import AdminCategories from './Pages/AdminCategories';
import AdminLogs from './Pages/AdminLogs';
import AdminLogin from './Pages/AdminLogin';
import OfficerLogin from './Pages/OfficerLogin';

// Public layout: renders the public marketing navbar and footer for public routes
const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Routes with Public Navbar & Footer */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/officer-login" element={<OfficerLogin />} />
              <Route path="/staff-login" element={<OfficerLogin />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Authenticated Workspace with Authenticated Application Shell */}
            <Route element={<AppLayout />}>
              {/* Citizen Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Citizen']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submit-complaint"
                element={
                  <ProtectedRoute allowedRoles={['Citizen']}>
                    <SubmitComplaint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-complaint/:id"
                element={
                  <ProtectedRoute allowedRoles={['Citizen']}>
                    <EditComplaint />
                  </ProtectedRoute>
                }
              />

              {/* Shared Protected Routes */}
              <Route
                path="/complaint/:id"
                element={
                  <ProtectedRoute allowedRoles={['Citizen', 'Department Officer', 'Administrator']}>
                    <ComplaintDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['Citizen', 'Department Officer', 'Administrator']}>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Department Officer Routes */}
              <Route
                path="/officer"
                element={
                  <ProtectedRoute allowedRoles={['Department Officer']}>
                    <OfficerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['Administrator']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['Administrator']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute allowedRoles={['Administrator']}>
                    <AdminCategories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/logs"
                element={
                  <ProtectedRoute allowedRoles={['Administrator']}>
                    <AdminLogs />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
