import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Layout/Sidebar.jsx';
import Header from '@/components/Layout/Header.jsx';
import SuperAdminOverview from '@/components/SuperAdmin/SuperAdminOverview.jsx';
import SchoolsManagement from '@/components/SuperAdmin/SchoolsManagement.jsx';
import AdminsManagement from '@/components/SuperAdmin/AdminsManagement.jsx';
import SuperAdminAnalytics from '@/components/SuperAdmin/SuperAdminAnalytics.jsx';
import SuperAdminSettings from '@/components/SuperAdmin/SuperAdminSettings.jsx';
import SubscriptionManagement from '@/components/SuperAdmin/SubscriptionManagement.jsx';
import SubscriptionPlansConfig from '@/components/SuperAdmin/SubscriptionPlansConfig.jsx';

export default function SuperAdminDashboard() {
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
    if (path === '/super-admin') return 'Dashboard Overview';
    if (path.includes('/subscriptions')) return 'Subscription Management';
    if (path.includes('/subscription-plans')) return 'Subscription Plans Configuration';
    if (path.includes('/schools')) return 'Schools Management';
    if (path.includes('/admins')) return 'Admins Management';
    if (path.includes('/analytics')) return 'Platform Analytics';
    if (path.includes('/settings')) return 'System Settings';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-slate-900">
      <Helmet>
        <title>Super Admin Dashboard - EduAnalytics</title>
        <meta name="description" content="Super admin dashboard for managing schools, administrators, and platform analytics across the EduAnalytics system." />
        <meta property="og:title" content="Super Admin Dashboard - EduAnalytics" />
        <meta property="og:description" content="Super admin dashboard for managing schools, administrators, and platform analytics across the EduAnalytics system." />
      </Helmet>

      <Sidebar 
        activeItem={activeItem} 
        onItemClick={handleItemClick}
        isMinimized={isSidebarMinimized}
        setIsMinimized={setIsSidebarMinimized}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getPageTitle()} />
        
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-auto p-6 scrollbar-hide"
        >
          <Routes>
            <Route path="/" element={<SuperAdminOverview />} />
            <Route path="/subscriptions" element={<SubscriptionManagement />} />
            <Route path="/subscription-plans" element={<SubscriptionPlansConfig />} />
            <Route path="/schools" element={<SchoolsManagement />} />
            <Route path="/admins" element={<AdminsManagement />} />
            <Route path="/analytics" element={<SuperAdminAnalytics />} />
            <Route path="/settings" element={<SuperAdminSettings />} />
          </Routes>
        </motion.main>
      </div>
    </div>
  );
}