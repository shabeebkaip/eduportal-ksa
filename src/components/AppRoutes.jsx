
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useData } from '@/contexts/DataContext.jsx';
import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import StudentParentLoginPage from '@/pages/StudentParentLoginPage.jsx';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard.jsx';
import SchoolAdminDashboard from '@/pages/SchoolAdminDashboard.jsx';
import TeacherDashboard from '@/pages/TeacherDashboard.jsx';
import StudentDashboard from '@/pages/StudentDashboard.jsx';

const SCHOOL_ADMIN_ROLES = ['school-admin', 'academic-director', 'head-of-section', 'subject-coordinator'];

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const { activeRole } = useData();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-slate-900 text-white"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(activeRole)) {
    let targetPath = '/';
    
    if (activeRole === 'super-admin') targetPath = '/super-admin';
    else if (SCHOOL_ADMIN_ROLES.includes(activeRole)) targetPath = '/school-admin';
    else if (activeRole === 'teacher') targetPath = '/teacher';
    else if (activeRole === 'student' || activeRole === 'parent') targetPath = '/student';

    return <Navigate to={targetPath} replace />;
  }
  
  return children;
}

export default function AppRoutes() {
  const { user, loading } = useAuth();
  const { activeRole } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && activeRole) {
        // Only navigate if we are on a public page (like /login) or at the root
        const isPublicPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/student-parent-login';
        
        if (isPublicPage) {
            let targetPath;
            if (activeRole === 'super-admin') targetPath = '/super-admin';
            else if (SCHOOL_ADMIN_ROLES.includes(activeRole)) targetPath = '/school-admin';
            else if (activeRole === 'teacher') targetPath = '/teacher';
            else if (activeRole === 'student' || activeRole === 'parent') targetPath = '/student';
            
            if (targetPath) {
                navigate(targetPath, { replace: true });
            }
        }
    }
  }, [activeRole, user, loading, navigate, location.pathname]);


  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-slate-900 text-white"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div></div>;
  }
  
  const basePath = !user ? '/' : 
    activeRole === 'super-admin' ? '/super-admin' :
    SCHOOL_ADMIN_ROLES.includes(activeRole) ? '/school-admin' :
    activeRole === 'teacher' ? '/teacher' :
    activeRole === 'student' || activeRole === 'parent' ? '/student' : '/';

  return (
    <Routes>
      <Route path="/" element={!user ? <HomePage /> : <Navigate to={basePath} replace />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={basePath} replace />} />
      <Route path="/student-parent-login" element={!user ? <StudentParentLoginPage /> : <Navigate to={basePath} replace />} />
      <Route 
        path="/super-admin/*" 
        element={
          <ProtectedRoute allowedRoles={['super-admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/school-admin/*" 
        element={
          <ProtectedRoute allowedRoles={SCHOOL_ADMIN_ROLES}>
            <SchoolAdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/*" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/*" 
        element={
          <ProtectedRoute allowedRoles={['student', 'parent']}>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to={basePath} replace />} />
    </Routes>
  );
}
