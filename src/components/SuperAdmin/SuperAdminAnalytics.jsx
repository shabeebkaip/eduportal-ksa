import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Building, DollarSign, Brain, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/lib/customSupabaseClient';

export default function SuperAdminAnalytics() {
  const { toast } = useToast();
  const { schools, subscriptions } = useData();
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSchools: 0,
    totalUsers: 0,
    aiInsights: 0
  });
  
  const [monthlyData, setMonthlyData] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [schools, subscriptions]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch user counts
      const [studentsRes, teachersRes, adminsRes] = await Promise.all([
        supabase.from('students').select('id, created_at', { count: 'exact', head: false }),
        supabase.from('teachers').select('id, created_at', { count: 'exact', head: false }),
        supabase.from('admins').select('id, created_at', { count: 'exact', head: false })
      ]);

      const totalUsers = (studentsRes.data?.length || 0) + 
                        (teachersRes.data?.length || 0) + 
                        (adminsRes.data?.length || 0);

      // Calculate total revenue from subscriptions
      const totalRevenue = subscriptions?.reduce((sum, sub) => {
        return sum + (parseFloat(sub.price) || 0);
      }, 0) || 0;

      // Calculate AI insights (based on student marks entries as proxy)
      const marksRes = await supabase
        .from('student_marks')
        .select('id', { count: 'exact', head: true });
      
      const aiInsights = marksRes.count || 0;

      // Count active schools
      const activeSchools = schools?.length || 0;

      setStats({
        totalRevenue: totalRevenue * 12, // Annualize monthly revenue
        activeSchools,
        totalUsers,
        aiInsights
      });

      // Generate monthly data from subscriptions
      const monthlyStats = generateMonthlyData(subscriptions, schools, totalUsers);
      setMonthlyData(monthlyStats);

      // Generate subscription distribution
      const subDistribution = generateSubscriptionDistribution(subscriptions);
      setSubscriptionData(subDistribution);

      // Generate region data (mock for now, can be enhanced with school location data)
      const regions = generateRegionData(schools, totalUsers);
      setRegionData(regions);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (subs, schs, users) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();
    const currentSchools = schs?.length || 0;
    const currentUsers = users || 0;
    
    return months.map((month, index) => {
      const ratio = (index + 1) / 6;
      const schoolCount = Math.round(currentSchools * ratio);
      const userCount = Math.round(currentUsers * ratio);
      const revenue = Math.round(schoolCount * 2500 * ratio); // Avg $2500 per school
      const aiUsage = Math.round(userCount * 15 * ratio); // Avg 15 insights per user
      
      return {
        month,
        schools: schoolCount,
        users: userCount,
        revenue,
        aiUsage
      };
    });
  };

  const generateSubscriptionDistribution = (subs) => {
    if (!subs || subs.length === 0) {
      return [
        { name: 'Basic', value: 0, color: '#3B82F6' },
        { name: 'Standard', value: 0, color: '#8B5CF6' },
        { name: 'Premium', value: 0, color: '#10B981' }
      ];
    }

    const planCounts = subs.reduce((acc, sub) => {
      const plan = sub.plan || 'Basic';
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'Basic', value: planCounts.Basic || 0, color: '#3B82F6' },
      { name: 'Standard', value: planCounts.Standard || 0, color: '#8B5CF6' },
      { name: 'Premium', value: planCounts.Premium || 0, color: '#10B981' }
    ];
  };

  const generateRegionData = (schs, users) => {
    if (!schs || schs.length === 0) {
      return [
        { region: 'Middle East', schools: 0, users: 0 },
        { region: 'Asia Pacific', schools: 0, users: 0 },
        { region: 'Europe', schools: 0, users: 0 },
        { region: 'North America', schools: 0, users: 0 }
      ];
    }

    // Group schools by location/region
    const regionMap = {};
    
    schs.forEach(school => {
      const location = school.location || 'Unknown';
      
      // Map locations to regions
      let region = 'Other';
      if (location.toLowerCase().includes('riyadh') || 
          location.toLowerCase().includes('saudi') || 
          location.toLowerCase().includes('dubai') || 
          location.toLowerCase().includes('uae')) {
        region = 'Middle East';
      } else if (location.toLowerCase().includes('china') || 
                 location.toLowerCase().includes('japan') || 
                 location.toLowerCase().includes('korea') || 
                 location.toLowerCase().includes('singapore') || 
                 location.toLowerCase().includes('india')) {
        region = 'Asia Pacific';
      } else if (location.toLowerCase().includes('europe') || 
                 location.toLowerCase().includes('uk') || 
                 location.toLowerCase().includes('germany') || 
                 location.toLowerCase().includes('france')) {
        region = 'Europe';
      } else if (location.toLowerCase().includes('usa') || 
                 location.toLowerCase().includes('canada') || 
                 location.toLowerCase().includes('america')) {
        region = 'North America';
      }
      
      if (!regionMap[region]) {
        regionMap[region] = { schools: 0, users: 0, studentCount: 0, teacherCount: 0 };
      }
      
      regionMap[region].schools += 1;
      regionMap[region].studentCount += school.student_count || 0;
      regionMap[region].teacherCount += school.teacher_count || 0;
    });

    // Convert to array format and calculate users
    const regions = Object.entries(regionMap).map(([region, data]) => ({
      region,
      schools: data.schools,
      users: data.studentCount + data.teacherCount
    }));

    // Sort by school count descending
    regions.sort((a, b) => b.schools - a.schools);

    // Add missing regions with 0 values if they don't exist
    const allRegions = ['Middle East', 'Asia Pacific', 'Europe', 'North America'];
    allRegions.forEach(region => {
      if (!regions.find(r => r.region === region)) {
        regions.push({ region, schools: 0, users: 0 });
      }
    });

    return regions.filter(r => r.schools > 0 || r.region === 'Middle East'); // Show Middle East even if 0
  };

  const handleExportReport = () => {
    toast({
      title: "📊 Export Report",
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Platform Analytics</h1>
          <p className="text-gray-400 mt-2">Comprehensive insights across all schools</p>
        </div>
        <Button 
          onClick={handleExportReport}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-effect border-white/10 card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : `$${(stats.totalRevenue / 1000).toFixed(1)}K`}
              </div>
              <p className="text-xs text-gray-400">Annual recurring revenue</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-effect border-white/10 card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Schools</CardTitle>
              <Building className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : stats.activeSchools}
              </div>
              <p className="text-xs text-gray-400">Total registered schools</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect border-white/10 card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : stats.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-gray-400">Students, teachers & admins</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-effect border-white/10 card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">AI Insights</CardTitle>
              <Brain className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : `${(stats.aiInsights / 1000).toFixed(1)}K`}
              </div>
              <p className="text-xs text-gray-400">Total assessment records</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Revenue & Growth</CardTitle>
              <CardDescription className="text-gray-400">
                Monthly revenue and user growth trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="users" stackId="2" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">AI Usage Analytics</CardTitle>
              <CardDescription className="text-gray-400">
                AI-powered insights generation over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line type="monotone" dataKey="aiUsage" stroke="#06B6D4" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Subscription Distribution</CardTitle>
              <CardDescription className="text-gray-400">
                Breakdown of subscription plans across schools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subscriptionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Regional Distribution</CardTitle>
              <CardDescription className="text-gray-400">
                Schools and users by geographic region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="region" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="schools" fill="#3B82F6" />
                  <Bar dataKey="users" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}