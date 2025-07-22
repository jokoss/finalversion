import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, ThemeProvider, CssBaseline } from '@mui/material';
import { useAuth } from './context/AuthContext';
import getTheme from './theme';

// Layout
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';

// Error Handling
import ErrorBoundary from './components/utils/ErrorBoundary.js';
import FallbackHomePage from './pages/public/FallbackHomePage';

// Public Pages
import HomePage from './pages/public/HomePage';
import ServicesPage from './pages/public/ServicesPage';
import ServiceCategoryPage from './pages/public/ServiceCategoryPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import NotFoundPage from './pages/public/NotFoundPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import TermsOfUsePage from './pages/public/TermsOfUsePage';
import BlogPage from './pages/public/BlogPage';
import BlogPostPage from './pages/public/BlogPostPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CategoryManagement from './pages/admin/CategoryManagement';
import TestManagement from './pages/admin/TestManagement';
import CertificationManagement from './pages/admin/CertificationManagement';
import UserManagement from './pages/admin/UserManagement';
import ProfilePage from './pages/admin/ProfilePage';
import ImageManagement from './pages/admin/ImageManagement';
import PartnerManagement from './pages/admin/PartnerManagement';
import BlogManagement from './pages/admin/BlogManagement';
import TestimonialManagement from './pages/admin/TestimonialManagement';
import GovernmentContractManagement from './pages/admin/GovernmentContractManagement';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false, superAdminOnly = false }) => {
  const { isAuthenticated, isAdmin, isSuperAdmin, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }

  if (superAdminOnly && !isSuperAdmin) {
    return <Navigate to="/admin" />;
  }

  return children;
};

function App() {
  const [themeMode, setThemeMode] = useState(() => {
    // Try to get the saved theme from localStorage
    const savedTheme = localStorage.getItem('themeMode');
    return savedTheme || 'default';
  });
  const theme = getTheme(themeMode);

  // Save theme preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          transition: 'background-color 0.3s ease, color 0.3s ease',
          minHeight: '100vh',
          width: '100%',
        }}
      >
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout setTheme={setThemeMode} />}>
          <Route index element={
            <ErrorBoundary
              fallback={(error) => <FallbackHomePage error={error} />}
            >
              <HomePage />
            </ErrorBoundary>
          } />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:categoryId" element={<ServiceCategoryPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogPostPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="terms-of-use" element={<TermsOfUsePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout setTheme={setThemeMode} />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="tests" element={<TestManagement />} />
          <Route path="certifications" element={<CertificationManagement />} />
          <Route path="images" element={<ImageManagement />} />
          <Route path="partners" element={<PartnerManagement />} />
          <Route path="blog" element={<BlogManagement />} />
          <Route path="testimonials" element={<TestimonialManagement />} />
          <Route path="government-contracts" element={<GovernmentContractManagement />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route 
            path="users" 
            element={
              <ProtectedRoute superAdminOnly>
                <UserManagement />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default App;
