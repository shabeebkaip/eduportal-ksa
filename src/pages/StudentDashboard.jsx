import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Layout/Sidebar.jsx';
import Header from '@/components/Layout/Header.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import AcademicYearSelector from '@/components/Layout/AcademicYearSelector.jsx';
import TermSelector from '@/components/Layout/TermSelector.jsx';
import StudentPerformance from '@/components/Student/StudentPerformance.jsx';

const StudentOverview = () => {
    const { toast } = useToast();
    React.useEffect(() => {
        toast({
            title: "👋 Welcome Student!",
            description: "This is your dashboard overview. Check your performance and progress! 🚀"
        });
    }, [toast]);
    return <div className="text-white">Student Overview placeholder</div>;
};

const StudentAssessments = () => {
    const { toast } = useToast();
    React.useEffect(() => {
        toast({
            title: "📝 My Assessments",
            description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
        });
    }, [toast]);
    return <div className="text-white">Student Assessments placeholder</div>;
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  const handleItemClick = (path) => {
    setActiveItem(path);
    navigate(path);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/student') return 'My Dashboard';
    if (path.includes('assessments')) return 'My Assessments';
    if (path.includes('performance-insights')) return 'My Performance & Insights';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-slate-900">
      <Helmet>
        <title>Student Dashboard - EduAnalytics</title>
        <meta name="description" content="Student dashboard for viewing assessments, tracking performance, and monitoring academic progress with personalized insights." />
        <meta property="og:title" content="Student Dashboard - EduAnalytics" />
        <meta property="og:description" content="Student dashboard for viewing assessments, tracking performance, and monitoring academic progress with personalized insights." />
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
            <Route path="/" element={<StudentOverview />} />
            <Route path="/assessments" element={<StudentAssessments />} />
            <Route path="/performance-insights" element={<StudentPerformance />} />
          </Routes>
        </motion.main>
      </div>
    </div>
  );
}