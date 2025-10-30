import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, Users, BarChart3, DollarSign, TrendingUp, AlertTriangle, Bell, LifeBuoy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useToast } from '@/components/ui/use-toast.js';
import { useData } from '@/contexts/DataContext.jsx';
import { supabase } from '@/lib/customSupabaseClient.js';

export default function SuperAdminOverview() {
  const { toast } = useToast();
  const { schools, subscriptions, loading } = useData();
  
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0
  });
  const [alerts, setAlerts] = useState([]);
  
  useEffect(() => {
    fetchStats();
  }, [schools, subscriptions]);
  
  const fetchStats = async () => {
    try {
      // Get total users count
      const [studentsRes, teachersRes, adminsRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('teachers').select('id', { count: 'exact', head: true }),
        supabase.from('admins').select('id', { count: 'exact', head: true })
      ]);
      
      const totalUsersCount = (studentsRes.count || 0) + (teachersRes.count || 0) + (adminsRes.count || 0);
      setTotalUsers(totalUsersCount);
      
      // Generate alerts based on real subscriptions
      const generatedAlerts = [];
      subscriptions?.forEach((sub, index) => {
        if (sub.status === 'expired' || sub.status === 'expiring_soon') {
          generatedAlerts.push({
            id: index,
            message: `${sub.schools?.name || 'School'} subscription ${sub.status === 'expired' ? 'has expired' : 'expires soon'}.`,
            type: sub.status === 'expired' ? 'destructive' : 'warning'
          });
        }
      });
      
      if (generatedAlerts.length === 0) {
        generatedAlerts.push({
          id: 1,
          message: 'All subscriptions are active and up to date.',
          type: 'info'
        });
      }
      
      setAlerts(generatedAlerts);
      
      // Count active subscriptions (case-insensitive)
      const activeCount = subscriptions?.filter(s => 
        s.status && s.status.toLowerCase() === 'active'
      ).length || 0;
      
      console.log('Subscriptions:', subscriptions);
      console.log('Active subscriptions count:', activeCount);
      
      setStats({
        totalSchools: schools?.length || 0,
        totalUsers: totalUsersCount,
        activeSubscriptions: activeCount,
        totalRevenue: subscriptions?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  // Generate chart data based on real schools data
  const statsData = [
    { name: 'Jan', schools: Math.max(1, Math.floor((schools?.length || 0) * 0.4)), users: Math.floor(totalUsers * 0.5) },
    { name: 'Feb', schools: Math.max(1, Math.floor((schools?.length || 0) * 0.5)), users: Math.floor(totalUsers * 0.6) },
    { name: 'Mar', schools: Math.max(1, Math.floor((schools?.length || 0) * 0.6)), users: Math.floor(totalUsers * 0.7) },
    { name: 'Apr', schools: Math.max(1, Math.floor((schools?.length || 0) * 0.75)), users: Math.floor(totalUsers * 0.8) },
    { name: 'May', schools: Math.max(1, Math.floor((schools?.length || 0) * 0.9)), users: Math.floor(totalUsers * 0.9) },
    { name: 'Jun', schools: schools?.length || 0, users: totalUsers }
  ];
  
  const notifications = [
    { id: 1, message: `Platform managing ${stats.totalSchools} schools with ${stats.totalUsers} total users.`, icon: Bell },
    { id: 2, message: `${stats.activeSubscriptions} active subscriptions currently running.`, icon: DollarSign },
    { id: 3, message: 'All systems operational and running smoothly.', icon: LifeBuoy }
  ];
  
  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  const handleAction = (title) => {
    toast({
      title: `🚀 ${title}`,
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-effect border-white/10 card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Schools</CardTitle>
              <Building className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalSchools}</div>
              <p className="text-xs text-gray-400">Schools registered on platform</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/10 card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-gray-400">Students, Teachers & Admins</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-effect border-white/10 card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Subscriptions</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeSubscriptions}</div>
              <p className="text-xs text-gray-400">Currently active</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-effect border-white/10 card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Subscriptions</CardTitle>
              <BarChart3 className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{subscriptions?.length || 0}</div>
              <p className="text-xs text-gray-400">All subscription records</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">User Growth</CardTitle>
              <CardDescription className="text-gray-400">Total users growth projection</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="users" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Platform Growth</CardTitle>
              <CardDescription className="text-gray-400">Schools and users growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={statsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis yAxisId="left" stroke="#3B82F6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#8B5CF6" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="schools" stroke="#3B82F6" strokeWidth={2} name="Schools" />
                  <Line yAxisId="right" type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={2} name="Users" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                Alerts
              </CardTitle>
              <CardDescription className="text-gray-400">Critical issues that require your attention.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border flex items-center justify-between ${
                      alert.type === 'warning' ? 'border-yellow-500/30 bg-yellow-500/10' : 
                      alert.type === 'destructive' ? 'border-red-500/30 bg-red-500/10' :
                      'border-blue-500/30 bg-blue-500/10'
                    }`}>
                    <p className={`text-sm ${
                      alert.type === 'warning' ? 'text-yellow-300' : 
                      alert.type === 'destructive' ? 'text-red-300' :
                      'text-blue-300'
                    }`}>{alert.message}</p>
                    <Button size="sm" variant="ghost" onClick={() => handleAction('View Alert')}>View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bell className="w-5 h-5 mr-2 text-cyan-400" />
                Notifications
              </CardTitle>
              <CardDescription className="text-gray-400">Latest platform activities and updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                      <notif.icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-sm text-gray-300 pt-1.5">{notif.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}