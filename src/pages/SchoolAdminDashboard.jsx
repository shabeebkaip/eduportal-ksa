import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import SchoolAdminOverview from '@/components/SchoolAdmin/SchoolAdminOverview';
import UsersManagement from '@/components/SchoolAdmin/UsersManagement';
import ClassesManagement from '@/components/SchoolAdmin/ClassesManagement';
import SubjectsManagement from '@/components/SchoolAdmin/SubjectsManagement';
import AssessmentsManagement from '@/components/SchoolAdmin/AssessmentsManagement';
import ReportsManagement from '@/components/SchoolAdmin/ReportsManagement';
import AIInsights from '@/components/SchoolAdmin/AIInsights';
import SchoolAdminSettings from '@/components/SchoolAdmin/SchoolAdminSettings';
import SubjectDetailsPage from '@/components/SchoolAdmin/SubjectDetailsPage';
import EditTeacherPage from '@/components/SchoolAdmin/management/EditTeacherPage';
import AcademicDirectorDashboard from '@/components/SchoolAdmin/AcademicDirectorDashboard';
import HeadOfSectionDashboard from '@/components/SchoolAdmin/HeadOfSectionDashboard';
import FullMarksheetReport from '@/components/SchoolAdmin/reports/FullMarksheetReport.jsx';
import { useData } from '@/contexts/DataContext';

const SchoolAdminDashboard = () => {
  const { loading: dataLoading, activeRole } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const handleItemClick = (path) => {
    setActiveItem(path);
    navigate(path);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.endsWith('/school-admin') || path.endsWith('/school-admin/')) return 'Dashboard Overview';
    if (path.includes('/users/teachers/edit')) return 'Edit Teacher';
    if (path.includes('/users')) return 'Users Management';
    if (path.includes('/classes')) return 'Classes Management';
    if (path.includes('/subjects')) return 'Subjects Management';
    if (path.includes('/assessments')) return 'Assessments Management';
    if (path.includes('/reports/full-marksheet')) return 'Full Marksheet Report';
    if (path.includes('/reports')) return 'Reports';
    if (path.includes('/ai-insights')) return 'AI Insights';
    if (path.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };
  
  const renderDashboardByRole = () => {
    switch(activeRole) {
      case 'academic-director':
        return <AcademicDirectorDashboard />;
      case 'head-of-section':
        return <HeadOfSectionDashboard />;
      case 'subject-coordinator':
        // Add a specific dashboard for subject-coordinator later if needed
        return <SchoolAdminOverview />;
      case 'school-admin':
      default:
        return <SchoolAdminOverview />;
    }
  }

  if (dataLoading) {
    return <div className="flex justify-center items-center h-screen bg-slate-900 text-white"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div></div>;
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar 
        activeItem={activeItem} 
        onItemClick={handleItemClick}
        isMinimized={isSidebarMinimized}
        setIsMinimized={setIsSidebarMinimized}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getPageTitle()} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <Routes>
            <Route path="/" element={renderDashboardByRole()} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="users/teachers/edit/:id" element={<EditTeacherPage />} />
            <Route path="classes" element={<ClassesManagement />} />
            <Route path="subjects" element={<SubjectsManagement />} />
            <Route path="subjects/:subjectId" element={<SubjectDetailsPage />} />
            <Route path="assessments" element={<AssessmentsManagement />} />
            <Route path="reports" element={<ReportsManagement />} />
            <Route path="reports/full-marksheet" element={<FullMarksheetReport />} />
            <Route path="ai-insights" element={<AIInsights />} />
            <Route path="settings" element={<SchoolAdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;