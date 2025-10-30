
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Layout/Sidebar.jsx';
import Header from '@/components/Layout/Header.jsx';
import AcademicYearSelector from '@/components/Layout/AcademicYearSelector.jsx';
import TermSelector from '@/components/Layout/TermSelector.jsx';
import TeacherOverview from '@/components/Teacher/TeacherOverview.jsx';
import TeacherAssessments from '@/components/Teacher/TeacherAssessments.jsx';
import MarksEntryPage from '@/components/Teacher/MarksEntryPage.jsx';
import PerformanceAnalytics from '@/components/Teacher/PerformanceAnalytics.jsx';
import ReportsManagement from '@/components/SchoolAdmin/ReportsManagement.jsx';
import FullMarksheetReport from '@/components/SchoolAdmin/reports/FullMarksheetReport.jsx';
import TeacherAIRecommendations from '@/components/Teacher/TeacherAIRecommendations.jsx';
import { useData } from '@/contexts/DataContext.jsx';

const SCHOOL_ADMIN_ROLES = ['school-admin', 'academic-director', 'head-of-section', 'subject-coordinator'];

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeRole } = useData();
  const [activeItem, setActiveItem] = useState(location.pathname);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  useEffect(() => {
    // This logic is now handled globally in AppRoutes.jsx
    if (SCHOOL_ADMIN_ROLES.includes(activeRole)) {
       navigate('/school-admin', { replace: true });
    }
  }, [activeRole, navigate]);

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const handleItemClick = (path) => {
    setActiveItem(path);
    navigate(path);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/teacher' || path === '/teacher/') return 'Dashboard Overview';
    if (path.includes('students')) return 'Students Roster';
    if (path.includes('assessments/marks-entry')) return 'Marks Entry';
    if (path.includes('assessments')) return 'Assessments';
    if (path.includes('performance-analytics')) return 'Performance Analytics';
    if (path.includes('reports/full-marksheet')) return 'Full Marksheet Report';
    if (path.includes('reports')) return 'Reports';
    if (path.includes('ai-recommendations')) return 'AI Recommendations';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-background">
      <Helmet>
        <title>Teacher Dashboard - EduAnalytics</title>
        <meta name="description" content="Teacher dashboard for managing assessments, entering marks, and analyzing student performance." />
        <meta property="og:title" content="Teacher Dashboard - EduAnalytics" />
        <meta property="og:description" content="Teacher dashboard for managing assessments, entering marks, and analyzing student performance." />
      </Helmet>

      <Sidebar 
        activeItem={activeItem} 
        onItemClick={handleItemClick}
        isMinimized={isSidebarMinimized}
        setIsMinimized={setIsSidebarMinimized}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getPageTitle()}>
          <div className="flex items-center space-x-2">
            <AcademicYearSelector />
            <TermSelector />
          </div>
        </Header>
        
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-auto p-6"
        >
          <Routes>
            <Route path="/" element={<TeacherOverview />} />
            <Route path="/assessments" element={<TeacherAssessments />} />
            <Route path="/assessments/marks-entry/:subAssessmentId" element={<MarksEntryPage />} />
            <Route path="/performance-analytics" element={<PerformanceAnalytics />} />
            <Route path="/reports" element={<ReportsManagement />} />
            <Route path="/reports/full-marksheet" element={<FullMarksheetReport />} />
            <Route path="/ai-recommendations" element={<TeacherAIRecommendations />} />
          </Routes>
        </motion.main>
      </div>
    </div>
  );
}
