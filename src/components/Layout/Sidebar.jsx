import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, School, BookOpen, BarChart3, Settings, LogOut, GraduationCap, FileText, Brain, Building, CreditCard, ChevronsLeft, ChevronsRight, Package } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useData } from '@/contexts/DataContext.jsx';
import { Button } from '@/components/ui/button.jsx';

const schoolAdminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/school-admin' },
  { icon: Users, label: 'Users', path: '/school-admin/users' },
  { icon: School, label: 'Classes', path: '/school-admin/classes' },
  { icon: BookOpen, label: 'Subjects', path: '/school-admin/subjects' },
  { icon: FileText, label: 'Assessments', path: '/school-admin/assessments' },
  { icon: BarChart3, label: 'Reports', path: '/school-admin/reports' },
  { icon: Brain, label: 'AI Insights', path: '/school-admin/ai-insights' },
  { icon: Settings, label: 'Settings', path: '/school-admin/settings' },
];

const menuItems = {
  'super-admin': [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/super-admin' },
    { icon: CreditCard, label: 'Subscriptions', path: '/super-admin/subscriptions' },
    // { icon: Package, label: 'Subscription Plans', path: '/super-admin/subscription-plans' },
    { icon: Building, label: 'Schools', path: '/super-admin/schools' },
    { icon: Users, label: 'Admins', path: '/super-admin/admins' },
    { icon: BarChart3, label: 'Analytics', path: '/super-admin/analytics' },
    { icon: Settings, label: 'Settings', path: '/super-admin/settings' },
  ],
  'school-admin': schoolAdminMenuItems,
  'academic-director': schoolAdminMenuItems,
  'head-of-section': schoolAdminMenuItems,
  'subject-coordinator': schoolAdminMenuItems,
  'teacher': [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher' },
    { icon: FileText, label: 'Assessments', path: '/teacher/assessments' },
    { icon: BarChart3, label: 'Performance', path: '/teacher/performance-analytics' },
    { icon: Brain, label: 'AI Recommendations', path: '/teacher/ai-recommendations' },
    { icon: BarChart3, label: 'Reports', path: '/teacher/reports' },
  ],
  'student': [
    { icon: LayoutDashboard, label: 'My Dashboard', path: '/student' },
    { icon: FileText, label: 'My Assessments', path: '/student/assessments' },
    { icon: BarChart3, label: 'My Performance & Insights', path: '/student/performance-insights' },
  ],
  'parent': [
    { icon: LayoutDashboard, label: 'Child\'s Dashboard', path: '/student' },
    { icon: FileText, label: 'Child\'s Assessments', path: '/student/assessments' },
    { icon: BarChart3, label: 'Child\'s Performance', path: '/student/performance-insights' },
  ],
};

const variants = {
  expanded: { width: "16rem" }, // 256px
  minimized: { width: "5rem" } // 80px
};

const logoVariants = {
    expanded: { opacity: 1, scale: 1 },
    minimized: { opacity: 0, scale: 0.8 }
}

const labelVariants = {
    expanded: { opacity: 1, x: 0 },
    minimized: { opacity: 0, x: -10 }
}

export default function Sidebar({
  activeItem,
  onItemClick,
  isMinimized,
  setIsMinimized
}) {
  const { user, signOut, isLoggingOut } = useAuth();
  const { currentSchool, activeRole } = useData();

  const items = menuItems[activeRole] || [];

  return (
    <motion.div
      animate={isMinimized ? "minimized" : "expanded"}
      variants={variants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen bg-card/70 backdrop-blur-lg border-r flex flex-col relative"
    >
      <div className={`p-4 border-b flex items-center ${isMinimized ? 'justify-center' : 'justify-between'}`}>
        <AnimatePresence>
        {!isMinimized && (
        <motion.div
          key="logo"
          initial="minimized"
          animate="expanded"
          exit="minimized"
          variants={logoVariants}
          transition={{ duration: 0.2 }}
          className="flex items-center space-x-3 overflow-hidden"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold gradient-text whitespace-nowrap">EduPortal</span>
            {currentSchool && <p className="text-xs text-muted-foreground whitespace-nowrap">{currentSchool.name}</p>}
          </div>
        </motion.div>
        )}
        </AnimatePresence>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsMinimized(!isMinimized)} 
          className="text-muted-foreground hover:text-foreground hover:bg-muted absolute -right-4 top-16 bg-card border rounded-full w-8 h-8"
        >
          {isMinimized ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {items.map((item, index) => (
          <motion.button
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onItemClick(item.path)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 overflow-hidden ${
              activeItem && activeItem.startsWith(item.path) && (item.path !== `/super-admin` || activeItem === `/super-admin`) && (item.path !== `/school-admin` || activeItem === `/school-admin`) && (item.path !== `/teacher` || activeItem === `/teacher`) && (item.path !== `/student` || activeItem === `/student`)
                ? 'bg-primary text-primary-foreground shadow-lg font-semibold'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            } ${isMinimized ? 'justify-center' : ''}`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
            {!isMinimized &&
                <motion.span
                    initial="minimized"
                    animate="expanded"
                    exit="minimized"
                    variants={labelVariants}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="font-medium text-sm text-left whitespace-nowrap">
                    {item.label}
                </motion.span>
            }
            </AnimatePresence>
          </motion.button>
        ))}
      </nav>

      <div className={`p-4 border-t ${isMinimized ? 'flex justify-center' : ''}`}>
        <Button
          onClick={signOut}
          disabled={isLoggingOut}
          variant="ghost"
          className={`w-full text-red-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 ${isMinimized ? 'justify-center p-0' : 'justify-start'}`}
        >
          <LogOut className={`w-5 h-5 ${!isMinimized ? 'mr-3' : ''}`} />
          <AnimatePresence>
          {!isMinimized && 
            <motion.span
                initial="minimized"
                animate="expanded"
                exit="minimized"
                variants={labelVariants}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap">
                {isLoggingOut ? 'Logging out...' : 'Logout'}
            </motion.span>
          }
          </AnimatePresence>
        </Button>
      </div>
    </motion.div>
  );
}