import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useData } from '@/contexts/DataContext';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { useTerm } from '@/contexts/TermContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, BrainCircuit, BarChart, PieChart as PieChartIcon, Activity, School } from 'lucide-react';
import { ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, Legend, Pie, Cell, ComposedChart, PieChart } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ icon, title, value, description, color, loading }) => {
  if (loading) {
    return (
      <Card className="glass-effect animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-slate-700 rounded w-2/4"></div>
          <div className="h-6 w-6 bg-slate-700 rounded-full"></div>
        </CardHeader>
        <CardContent>
          <div className="h-10 bg-slate-700 rounded w-1/4 mt-2"></div>
          <div className="h-3 bg-slate-700 rounded w-3/4 mt-2"></div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className={`glass-effect border-${color}-500/20`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-white">{value}</div>
        <p className="text-xs text-gray-400">{description}</p>
      </CardContent>
    </Card>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 glass-effect text-white rounded-md border border-white/10">
        <p className="label font-bold">{`${label}`}</p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.color }}>{`${pld.name}: ${pld.value.toFixed(1)}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

const HeadOfSectionDashboard = () => {
  const { user } = useAuth();
  const { teachers, students, loading: dataLoading } = useData();
  const { academicYear } = useAcademicYear();
  const { term, availableTerms } = useTerm();
  const { toast } = useToast();

  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTermId, setSelectedTermId] = useState(null);
  
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const currentUser = useMemo(() => {
    if (!user || !teachers) return null;
    return teachers.find(t => t.user_id === user.id);
  }, [user, teachers]);

  useEffect(() => {
    if (currentUser?.assignments?.['head-of-section']?.classes) {
      const classes = currentUser.assignments['head-of-section'].classes;
      setAssignedClasses(classes);
      if (classes.length > 0 && !selectedClass) {
        setSelectedClass(JSON.stringify(classes[0]));
      }
    }
  }, [currentUser, selectedClass]);

  useEffect(() => {
    if (term) {
      setSelectedTermId(term.id.toString());
    } else if (availableTerms.length > 0) {
      setSelectedTermId(availableTerms[0].id.toString());
    }
  }, [term, availableTerms]);

  const stats = useMemo(() => {
    if (dataLoading || assignedClasses.length === 0) {
      return { studentCount: 0, teacherCount: 0 };
    }
    const relevantStudents = students.filter(s => 
      assignedClasses.some(ac => 
        ac.major === s.major && 
        ac.group_desc === s.group_desc && 
        ac.class_desc === s.class_desc && 
        ac.section_name === s.section_name
      )
    );
    
    const relevantTeachers = teachers.filter(t => 
      t.assignments?.teacher?.some(ta => 
        assignedClasses.some(ac => 
          ac.major === ta.major && 
          ac.group_desc === ta.group_desc && 
          ac.class_desc === ta.class_desc && 
          ac.section_name === ta.section_name
        )
      )
    );

    return {
      studentCount: relevantStudents.length,
      teacherCount: new Set(relevantTeachers.map(t => t.id)).size
    };
  }, [dataLoading, students, teachers, assignedClasses]);
  
  const fetchAnalytics = async () => {
    if (!selectedClass || !selectedTermId) {
      toast({ title: "Please select a class and a term.", variant: "destructive" });
      return;
    }
    setLoadingAnalytics(true);
    setAnalytics(null);
    try {
      const classParams = JSON.parse(selectedClass);
      const { data, error } = await supabase.rpc('get_performance_analytics_v3', {
        p_school_id: user.user_metadata.school_id,
        p_academic_year: academicYear,
        p_term_id: parseInt(selectedTermId),
        p_major: classParams.major,
        p_group_desc: classParams.group_desc,
        p_class_desc: classParams.class_desc,
        p_section_name: classParams.section_name
      });
      if (error) throw error;
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({ title: "Failed to fetch analytics", description: error.message, variant: "destructive" });
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F'];

  if (dataLoading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div></div>;
  }

  if (!currentUser || assignedClasses.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-lg text-center glass-effect">
          <CardHeader>
            <CardTitle className="text-white">No Assigned Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Your Head of Section dashboard is ready, but you have not been assigned to any classes yet.
            </p>
            <p className="text-gray-400 mt-2">
              Please contact a School Administrator to have them assign you to one or more classes so you can view your dashboard and analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Head of Section Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview for your assigned classes for {academicYear}.</p>
      </motion.div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard loading={dataLoading} icon={<Users className="h-5 w-5 text-cyan-400" />} title="Total Students" value={stats.studentCount} description={`in ${assignedClasses.length} class(es)`} color="cyan"/>
        <StatCard loading={dataLoading} icon={<UserCheck className="h-5 w-5 text-green-400" />} title="Total Teachers" value={stats.teacherCount} description="Active in your classes" color="green"/>
        <StatCard loading={dataLoading} icon={<School className="h-5 w-5 text-yellow-400" />} title="Classes Assigned" value={assignedClasses.length} description="Under your responsibility" color="yellow"/>
        <StatCard loading={dataLoading} icon={<Activity className="h-5 w-5 text-purple-400" />} title="Current Term" value={term?.name || 'N/A'} description="Active academic period" color="purple"/>
      </div>
      
      <Card className="glass-effect border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center"><BrainCircuit className="w-6 h-6 mr-3 text-purple-400"/>Class Performance Analytics</CardTitle>
          <CardDescription className="text-gray-400">Select a class and term to generate detailed performance insights.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-sm font-medium text-gray-300">Class</label>
              <Select value={selectedClass || ''} onValueChange={setSelectedClass}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select a class" /></SelectTrigger>
                <SelectContent className="glass-effect border-white/10">{assignedClasses.map((c, i) => <SelectItem key={i} value={JSON.stringify(c)}>{`${c.major} / ${c.group_desc} / ${c.class_desc} (${c.section_name})`}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-sm font-medium text-gray-300">Term</label>
              <Select value={selectedTermId || ''} onValueChange={setSelectedTermId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select a term" /></SelectTrigger>
                <SelectContent className="glass-effect border-white/10">{availableTerms.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={fetchAnalytics} disabled={loadingAnalytics} className="bg-gradient-to-r from-blue-500 to-purple-600">
              {loadingAnalytics ? 'Analyzing...' : 'Generate Analytics'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <AnimatePresence>
        {loadingAnalytics && <div className="text-center p-8"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div><p className="mt-4 text-gray-400">Loading analytics...</p></div>}
        
        {analytics && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-effect border-white/10">
                    <CardHeader><CardTitle className="text-white flex items-center"><PieChartIcon className="w-5 h-5 mr-2 text-cyan-400"/>Grade Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={analytics.grade_distribution} dataKey="count" nameKey="grade" cx="50%" cy="50%" outerRadius={120} label>
                                    {analytics.grade_distribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend/>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="glass-effect border-white/10">
                    <CardHeader><CardTitle className="text-white flex items-center"><BarChart className="w-5 h-5 mr-2 text-green-400"/>Subject Performance</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={analytics.subject_performance} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                               <XAxis type="number" stroke="#9ca3af" domain={[0, 100]}/>
                               <YAxis dataKey="subject_name" type="category" stroke="#9ca3af" width={100} tick={{fontSize: 12}}/>
                               <Tooltip content={<CustomTooltip />} />
                               <Legend />
                               <Bar dataKey="average_grade" barSize={20} fill="#82ca9d" name="Average Grade" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="glass-effect border-white/10">
              <CardHeader><CardTitle className="text-white flex items-center"><Users className="w-5 h-5 mr-2 text-blue-400"/>Student Rankings</CardTitle></CardHeader>
              <CardContent>
                  <div className="overflow-auto max-h-[500px]">
                      <Table>
                          <TableHeader>
                              <TableRow className="border-white/10 hover:bg-white/5">
                                  <TableHead className="text-white">Rank</TableHead>
                                  <TableHead className="text-white">Student Name</TableHead>
                                  <TableHead className="text-white">Student Code</TableHead>
                                  <TableHead className="text-white text-right">Final Average</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {analytics.student_performance.map(student => (
                                  <TableRow key={student.student_id} className="border-white/10 hover:bg-white/5">
                                      <TableCell className="font-bold text-lg">{student.rank}</TableCell>
                                      <TableCell>{student.student_name}</TableCell>
                                      <TableCell className="text-gray-400">{student.student_code}</TableCell>
                                      <TableCell className="text-right">
                                          <Badge variant={student.final_average >= 80 ? "default" : student.final_average >= 60 ? "secondary" : "destructive"}>
                                              {student.final_average.toFixed(2)}%
                                          </Badge>
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </div>
              </CardContent>
            </Card>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeadOfSectionDashboard;