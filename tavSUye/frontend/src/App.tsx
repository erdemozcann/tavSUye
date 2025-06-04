import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useEffect } from 'react';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Verify2FA from './pages/Verify2FA';
import VerifyEmail from './pages/VerifyEmail';
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Instructors from './pages/Instructors';
import InstructorDetail from './pages/InstructorDetail';
import Programs from './pages/Programs';
import ProgramDetail from './pages/ProgramDetail';
import Planner from './pages/Planner';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminAddCourse from './pages/AdminAddCourse';
import AdminChangeCourse from './pages/AdminChangeCourse';
import AdminAddInstructor from './pages/AdminAddInstructor';

import './App.css';

// Wrapper components for layout
const MainAppLayout = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

export default function App() {
  // Clean up any demo mode flags on app startup
  useEffect(() => {
    // Clear all demo and auto-login related data
    localStorage.removeItem('demo_user_mode');
    sessionStorage.removeItem('autoLoginAttempts');
    
    // Also clear any corrupted authentication state
    const isAuth = localStorage.getItem('isAuthenticated');
    const user = localStorage.getItem('user');
    
    // If we have inconsistent auth state, clear everything
    if ((isAuth === 'true' && !user) || (isAuth !== 'true' && user)) {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-2fa" element={<Verify2FA />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute><MainAppLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="add-course" element={<AdminAddCourse />} />
              <Route path="change-course" element={<AdminChangeCourse />} />
              <Route path="add-instructor" element={<AdminAddInstructor />} />
            </Route>
            
            {/* Main app routes */}
            <Route path="/" element={<ProtectedRoute><MainAppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/instructors" element={<Instructors />} />
              <Route path="/instructors/:id" element={<InstructorDetail />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/programs/:id" element={<ProgramDetail />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}
