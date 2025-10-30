import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, Award, AlertTriangle, Percent, Trophy, BookOpen, Search } from 'lucide-react';

const StatCard = ({ icon, label, value, unit, color }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
    <Card className="glass-effect border-white/10 h-full">
      <CardContent className="p-4 flex items-center">
        <div className={`p-3 rounded-full mr-4 bg-${color}-500/20`}>{icon}</div>
        <div>
          <div className="text-sm text-gray-400">{label}</div>
          <div className="text-2xl font-bold text-white">{value}<span className="text-lg">{unit}</span></div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-lg text-white">
        <p className="font-bold">{label}</p>
        {Object.entries(data).filter(([key]) => key !== 'name').map(([key, val]) => (
          <p key={key} className="text-sm capitalize">{`${key.replace('_', ' ')}: ${typeof val === 'number' ? val.toFixed(2) + '%' : val}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PerformanceAnalytics() {
  const { user } = useAuth();
  const { academicYear } = useAcademicYear();
  const { students: allStudents } = useData();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [filters, setFilters] = useState({
    term_id: '',
    major: 'all',
    group_desc: 'all',
    class_desc: 'all',
    section_name: 'all',
  });
  const [availableTerms, setAvailableTerms] = useState([]);

  useEffect(() => {
    const fetchTerms = async () => {
        if (!user || !academicYear) return;
        const { data, error } = await supabase.from('terms').select('*').eq('school_id', user.user_metadata.school_id).eq('academic_year', academicYear);
        if (error) {
            toast({ variant: 'destructive', title: 'Error fetching terms', description: error.message });
        } else {
            setAvailableTerms(data);
            if (data.length > 0) {
                setFilters(prev => ({ ...prev, term_id: data[0].id.toString() }));
            }
        }
    };
    fetchTerms();
  }, [user, academicYear, toast]);

  const availableMajors = useMemo(() => {
    if (!allStudents || allStudents.length === 0) return [];
    return ['all', ...[...new Set(allStudents.map(s => s.major).filter(Boolean))].sort()];
  }, [allStudents]);

  const availableGroups = useMemo(() => {
    if (!allStudents || filters.major === 'all') return ['all'];
    return ['all', ...[...new Set(allStudents.filter(s => s.major === filters.major).map(s => s.group_desc).filter(Boolean))].sort()];
  }, [allStudents, filters.major]);

  const availableClasses = useMemo(() => {
    if (!allStudents || filters.group_desc === 'all') return ['all'];
    return ['all', ...[...new Set(allStudents.filter(s => s.major === filters.major && s.group_desc === filters.group_desc).map(s => s.class_desc).filter(Boolean))].sort()];
  }, [allStudents, filters.major, filters.group_desc]);

  const availableSections = useMemo(() => {
    if (!allStudents || filters.class_desc === 'all') return ['all'];
    return ['all', ...[...new Set(allStudents.filter(s => s.major === filters.major && s.group_desc === filters.group_desc && s.class_desc === filters.class_desc).map(s => s.section_name).filter(Boolean))].sort()];
  }, [allStudents, filters.major, filters.group_desc, filters.class_desc]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterName]: value };
      if (filterName === 'major') {
        newFilters.group_desc = 'all';
        newFilters.class_desc = 'all';
        newFilters.section_name = 'all';
      }
      if (filterName === 'group_desc') {
        newFilters.class_desc = 'all';
        newFilters.section_name = 'all';
      }
      if (filterName === 'class_desc') {
        newFilters.section_name = 'all';
      }
      return newFilters;
    });
  };

  const fetchAnalytics = async () => {
    if (!filters.term_id) {
        toast({ variant: 'destructive', title: 'Please select a term.' });
        return;
    }
    setLoading(true);
    setAnalyticsData(null);
    try {
        const rpc_params = {
            p_school_id: user.user_metadata.school_id,
            p_academic_year: academicYear,
            p_term_id: parseInt(filters.term_id),
            p_major: filters.major === 'all' ? null : filters.major,
            p_group_desc: filters.group_desc === 'all' ? null : filters.group_desc,
            p_class_desc: filters.class_desc === 'all' ? null : filters.class_desc,
            p_section_name: filters.section_name === 'all' ? null : filters.section_name,
        };
        const { data, error } = await supabase.rpc('get_performance_analytics_v3', rpc_params);

        if (error) throw error;
        setAnalyticsData(data);
    } catch(error) {
        toast({ variant: 'destructive', title: 'Error fetching analytics', description: error.message });
    } finally {
        setLoading(false);
    }
  };

  const PIE_COLORS = ['#22c55e', '#84cc16', '#facc15', '#f97316', '#ef4444'];
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
        {`${payload.name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };
  
  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold gradient-text">Performance Analytics</h1>
        
        <Card className="glass-effect border-white/10">
            <CardHeader>
                <CardTitle className="text-white">Analytics Filters</CardTitle>
                <CardDescription className="text-gray-400">Select parameters to generate performance dashboards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Select value={filters.term_id} onValueChange={v => handleFilterChange('term_id', v)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select Term..." /></SelectTrigger>
                        <SelectContent className="glass-effect border-white/10">{availableTerms.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={filters.major} onValueChange={v => handleFilterChange('major', v)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="glass-effect border-white/10">{availableMajors.map(m => <SelectItem key={m} value={m}>{m === 'all' ? 'All Majors' : m}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={filters.group_desc} onValueChange={v => handleFilterChange('group_desc', v)} disabled={filters.major === 'all'}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="glass-effect border-white/10">{availableGroups.map(g => <SelectItem key={g} value={g}>{g === 'all' ? 'All Groups' : g}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={filters.class_desc} onValueChange={v => handleFilterChange('class_desc', v)} disabled={filters.group_desc === 'all'}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="glass-effect border-white/10">{availableClasses.map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'All Classes' : c}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={filters.section_name} onValueChange={v => handleFilterChange('section_name', v)} disabled={filters.class_desc === 'all'}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="glass-effect border-white/10">{availableSections.map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All Sections' : s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <Button onClick={fetchAnalytics} disabled={loading} className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-600">
                    <Search className="w-4 h-4 mr-2" />
                    {loading ? 'Analyzing...' : 'Generate Dashboard'}
                </Button>
            </CardContent>
        </Card>

        {loading && <div className="text-center text-white p-8">Loading Analytics...</div>}
        
        {!loading && analyticsData && (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard icon={<Percent className="w-6 h-6 text-cyan-400"/>} label="Average Score" value={analyticsData.summary_stats.average_score?.toFixed(2)} unit="%" color="cyan" />
                    <StatCard icon={<TrendingUp className="w-6 h-6 text-green-400"/>} label="Highest Score" value={analyticsData.summary_stats.max_score?.toFixed(2)} unit="%" color="green" />
                    <StatCard icon={<TrendingDown className="w-6 h-6 text-red-400"/>} label="Lowest Score" value={analyticsData.summary_stats.min_score?.toFixed(2)} unit="%" color="red" />
                    <StatCard icon={<Users className="w-6 h-6 text-purple-400"/>} label="Total Students" value={analyticsData.summary_stats.total_students} color="purple" />
                    <StatCard icon={<Award className="w-6 h-6 text-yellow-400"/>} label="Top Performers" value={analyticsData.summary_stats.top_performers} color="yellow" />
                    <StatCard icon={<AlertTriangle className="w-6 h-6 text-orange-400"/>} label="At-Risk Students" value={analyticsData.summary_stats.at_risk_students} color="orange" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="glass-effect border-white/10">
                        <CardHeader><CardTitle className="text-white">Subject Performance Comparison</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analyticsData.subject_performance}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                    <XAxis dataKey="subject_name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }}/>
                                    <Legend />
                                    <Bar dataKey="average_grade" fill="#22d3ee" name="Average Grade" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="glass-effect border-white/10">
                        <CardHeader><CardTitle className="text-white">Performance Tiers</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={analyticsData.grade_distribution} dataKey="count" nameKey="grade" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={renderCustomizedLabel}>
                                        {analyticsData.grade_distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <Card className="glass-effect border-white/10">
                    <CardHeader><CardTitle className="text-white">Performance Trend Over Terms</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analyticsData.performance_trend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" domain={[0, 100]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line type="monotone" dataKey="average_grade" stroke="#8884d8" name="Average Grade" />
                                {analyticsData.performance_trend && analyticsData.performance_trend.length > 0 && Object.keys(analyticsData.performance_trend[0]).filter(k => k !== 'name' && k !== 'average_grade').map((key, i) => (
                                  <Line key={key} type="monotone" dataKey={key} stroke={`hsl(${i * 60}, 70%, 50%)`} name={key} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

            </div>
        )}

    </div>
  );
}