import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddContact from './pages/AddContact';
import EditContact from './pages/EditContact';
import ContactDetails from './pages/ContactDetails';
import Favorites from './pages/Favorites';
import Settings from './pages/Settings';

// Protected route wrapper component
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('contact_user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public route wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const user = localStorage.getItem('contact_user');
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-contact"
          element={
            <ProtectedRoute>
              <AddContact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-contact/:id"
          element={
            <ProtectedRoute>
              <EditContact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact/:id"
          element={
            <ProtectedRoute>
              <ContactDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
