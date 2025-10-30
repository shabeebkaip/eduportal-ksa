import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { useTerm } from '@/contexts/TermContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, Award, AlertTriangle, Percent, Trophy, FileText, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
        <p className="label text-white">{`Grade: ${label}`}</p>
        <p className="intro text-cyan-400">{`Students: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const StatCard = ({ icon, label, value, unit, color }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="glass-effect border-white/10">
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

export default function PerformanceAnalytics() {
  const { user } = useAuth();
  const { academicYear } = useAcademicYear();
  const { term } = useTerm();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [mainAssessments, setMainAssessments] = useState([]);
  const [subAssessments, setSubAssessments] = useState([]);
  
  const [analysisType, setAnalysisType] = useState('term'); // term, main_assessment, sub_assessment
  const [selectedMainAssessmentId, setSelectedMainAssessmentId] = useState('');
  const [selectedSubAssessmentId, setSelectedSubAssessmentId] = useState('');
  
  const [performanceData, setPerformanceData] = useState(null);

  const fetchInitialData = useCallback(async () => {
    if (!user || !academicYear) return;
    setLoading(true);
    try {
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers').select('id').eq('user_id', user.id).single();
      if (teacherError) throw teacherError;

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('teacher_assignments')
        .select('id, major, group_desc, class_desc, section_name, subjects(name)')
        .eq('teacher_id', teacherData.id)
        .eq('academic_year', academicYear);
      if (assignmentsError) throw assignmentsError;

      const formattedAssignments = assignmentsData.map(a => ({ ...a, subject_name: a.subjects.name }));
      setTeacherAssignments(formattedAssignments);
      if (formattedAssignments.length > 0) {
        setSelectedAssignmentId(formattedAssignments[0].id.toString());
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to fetch assignments', description: error.message });
    } finally {
        setLoading(false);
    }
  }, [user, academicYear, toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const fetchAssessments = useCallback(async () => {
    if (!selectedAssignmentId || !term) return;
    try {
        const { data, error } = await supabase
            .from('main_assessments')
            .select('id, name, sub_assessments(id, name)')
            .eq('assignment_id', selectedAssignmentId)
            .eq('term_id', term.id);
        if (error) throw error;

        const mainAssessmentsData = data || [];
        setMainAssessments(mainAssessmentsData);
        
        const allSubAssessments = mainAssessmentsData.flatMap(m => m.sub_assessments || []);
        setSubAssessments(allSubAssessments);

        setPerformanceData(null);
        setSelectedMainAssessmentId('');
        setSelectedSubAssessmentId('');

    } catch (error) {
        toast({ variant: 'destructive', title: 'Failed to fetch assessments', description: error.message });
    }
  }, [selectedAssignmentId, term, toast]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const fetchPerformanceData = useCallback(async () => {
    if (!term || !selectedAssignmentId) return;
    
    let rpc_params = {
        p_term_id: term.id,
        p_assignment_id: selectedAssignmentId,
        p_main_assessment_id: null,
        p_sub_assessment_id: null
    };

    if (analysisType === 'main_assessment' && selectedMainAssessmentId) {
        rpc_params.p_main_assessment_id = selectedMainAssessmentId;
    } else if (analysisType === 'sub_assessment' && selectedSubAssessmentId) {
        rpc_params.p_sub_assessment_id = selectedSubAssessmentId;
    } else if (analysisType !== 'term') {
        setPerformanceData(null);
        return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_performance_analytics_v3', rpc_params);
      if (error) throw error;
      setPerformanceData(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to fetch performance data', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [term, selectedAssignmentId, analysisType, selectedMainAssessmentId, selectedSubAssessmentId, toast]);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  const studentData = useMemo(() => performanceData?.student_performance || [], [performanceData]);
  const gradeDistributionData = useMemo(() => performanceData?.grade_distribution || [], [performanceData]);
  const summaryStats = useMemo(() => performanceData?.summary_stats, [performanceData]);
  const gradeColors = ['#22c55e', '#84cc16', '#facc15', '#f97316', '#ef4444'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-wider">Futuristic Performance Analysis</h1>
        <Button onClick={() => navigate('/teacher/reports/full-marksheet')} className="bg-gradient-to-r from-purple-500 to-indigo-600">
            <FileText className="w-4 h-4 mr-2" /> Full Marksheet Report <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
      
      <Card className="glass-effect border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
          <CardDescription className="text-gray-400">Select a class and analysis type to beam up the data.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select value={selectedAssignmentId} onValueChange={setSelectedAssignmentId}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select a class..." /></SelectTrigger>
            <SelectContent className="glass-effect border-white/10">
              {teacherAssignments.map(a => (
                <SelectItem key={a.id} value={a.id.toString()}>
                  {a.major} / {a.group_desc} / {a.class_desc} ({a.section_name}) - {a.subject_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={analysisType} onValueChange={setAnalysisType}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Analysis Type" /></SelectTrigger>
            <SelectContent className="glass-effect border-white/10">
                <SelectItem value="term">Term Overview</SelectItem>
                <SelectItem value="main_assessment">By Main Assessment</SelectItem>
                <SelectItem value="sub_assessment">By Sub-Assessment</SelectItem>
            </SelectContent>
          </Select>
          {analysisType === 'main_assessment' && (
            <Select value={selectedMainAssessmentId} onValueChange={setSelectedMainAssessmentId} disabled={mainAssessments.length === 0}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select Main Assessment..." /></SelectTrigger>
                <SelectContent className="glass-effect border-white/10">
                {mainAssessments.map(m => (
                    <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                ))}
                </SelectContent>
            </Select>
          )}
          {analysisType === 'sub_assessment' && (
            <Select value={selectedSubAssessmentId} onValueChange={setSelectedSubAssessmentId} disabled={subAssessments.length === 0}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select Sub-Assessment..." /></SelectTrigger>
                <SelectContent className="glass-effect border-white/10">
                {subAssessments.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                ))}
                </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {loading && <div className="text-white text-center p-8">Analyzing data streams...</div>}
      
      {!loading && !performanceData?.student_performance?.length > 0 && (
        <Card className="glass-effect border-white/10 text-center p-8">
            <CardTitle className="text-white">Awaiting Data Input</CardTitle>
            <CardDescription className="text-gray-400">Please select filters and ensure marks are entered to view analytics.</CardDescription>
        </Card>
      )}

      {!loading && performanceData?.student_performance?.length > 0 && summaryStats &&(
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon={<Percent className="w-6 h-6 text-cyan-400"/>} label="Class Average" value={summaryStats.average_score?.toFixed(2)} unit="%" color="cyan" />
            <StatCard icon={<TrendingUp className="w-6 h-6 text-green-400"/>} label="Highest Score" value={summaryStats.max_score?.toFixed(2)} unit="%" color="green" />
            <StatCard icon={<TrendingDown className="w-6 h-6 text-red-400"/>} label="Lowest Score" value={summaryStats.min_score?.toFixed(2)} unit="%" color="red" />
            <StatCard icon={<Users className="w-6 h-6 text-purple-400"/>} label="Total Students" value={summaryStats.total_students} color="purple" />
            <StatCard icon={<Award className="w-6 h-6 text-yellow-400"/>} label="Top Performers" value={summaryStats.top_performers} color="yellow" />
            <StatCard icon={<AlertTriangle className="w-6 h-6 text-orange-400"/>} label="Students At-Risk" value={summaryStats.at_risk_students} color="orange" />
          </div>

          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Grade Distribution</CardTitle>
              <CardDescription className="text-gray-400">Performance spread across the class.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gradeDistributionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="grade" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }}/>
                  <Bar dataKey="count" name="Number of Students">
                    {gradeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={gradeColors[index % gradeColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Student Performance Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-300">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-3">Rank</th>
                      <th className="p-3">Student</th>
                      <th className="p-3 text-right">Total Grade</th>
                      <th className="p-3">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentData.map((student) => (
                      <tr key={student.student_id} className="border-b border-white/20 hover:bg-white/5">
                        <td className="p-3 font-bold text-lg text-white">{student.rank}</td>
                        <td className="p-3">
                            <div className="font-semibold text-white flex items-center">
                              {student.student_name}
                              {student.weighted_average >= 90 && <Trophy className="w-4 h-4 ml-2 text-yellow-400" />}
                              {student.weighted_average < 50 && <AlertTriangle className="w-4 h-4 ml-2 text-orange-400" />}
                            </div>
                            <div className="text-sm text-gray-400 font-mono">{student.student_code}</div>
                        </td>
                        <td className="p-3 text-right font-bold text-lg text-cyan-400">{student.weighted_average.toFixed(2)}%</td>
                        <td className="p-3">
                          <Progress value={student.weighted_average} className="w-full" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}