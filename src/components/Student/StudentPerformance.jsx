import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { useTerm } from '@/contexts/TermContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Lightbulb, TrendingUp, TrendingDown, BookOpen } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const InsightCard = ({ insight, index }) => {
  const categoryMap = {
    'Student At-Risk': { icon: <TrendingDown className="w-6 h-6 text-red-400" />, color: 'border-red-500/50 bg-red-500/10', titleColor: 'text-red-300' },
    'Top Achiever': { icon: <TrendingUp className="w-6 h-6 text-green-400" />, color: 'border-green-500/50 bg-green-500/10', titleColor: 'text-green-300' },
    'General': { icon: <Lightbulb className="w-6 h-6 text-cyan-400" />, color: 'border-cyan-500/50 bg-cyan-500/10', titleColor: 'text-cyan-300' },
  };

  const { icon, color, titleColor } = categoryMap[insight.category] || categoryMap.General;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay: index * 0.1, type: 'spring', stiffness: 120 }}
      className={`rounded-lg p-6 ${color} space-y-4`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${titleColor}`}>{insight.category}</p>
          <h3 className="text-lg font-bold text-white">{insight.title}</h3>
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-white">Observation:</h4>
        <p className="text-gray-300">{insight.observation}</p>
      </div>
      <div>
        <h4 className="font-semibold text-white">Recommendation:</h4>
        <p className="text-gray-300">{insight.recommendation}</p>
      </div>
    </motion.div>
  );
};

export default function StudentPerformance() {
  const { user } = useAuth();
  const { academicYear } = useAcademicYear();
  const { term } = useTerm();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !academicYear || !term) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const { data: studentAccess, error: accessError } = await supabase.rpc('get_user_report_access_v2', { p_user_id: user.id });

        if (accessError || !studentAccess || studentAccess.length === 0) {
            throw new Error(accessError?.message || "Could not retrieve student details.");
        }
        
        const studentDetails = studentAccess[0];
        setStudentInfo(studentDetails);

        const analyticsParams = {
            p_school_id: user.user_metadata.school_id,
            p_academic_year: academicYear,
            p_term_id: term.id,
            p_major: studentDetails.major,
            p_group_desc: studentDetails.group_desc,
            p_class_desc: studentDetails.class_desc,
            p_section_name: studentDetails.section_name
        };
        
        const { data: analyticsData, error: analyticsError } = await supabase.rpc('get_performance_analytics_v3', analyticsParams);
        if (analyticsError) throw analyticsError;
        
        const myPerformance = analyticsData.student_performance.find(s => s.student_id === studentDetails.student_id);
        const myData = {
          ...analyticsData,
          student_performance: myPerformance ? [myPerformance] : []
        };
        setAnalytics(myData);

        const aiParams = {
            school_id: user.user_metadata.school_id,
            academic_year: academicYear,
            term_id: term.id,
            user_id: user.id,
            student_id: studentDetails.student_id
        };

        const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-ai-insights', { body: JSON.stringify(aiParams) });

        if (aiError) throw aiError;
        
        const studentInsights = Array.isArray(aiData) ? aiData.filter(i => i.target_audience.includes('student')) : [];
        setInsights(studentInsights);

      } catch (error) {
        toast({ variant: 'destructive', title: 'Failed to load performance data.', description: error.message });
        setAnalytics(null);
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, academicYear, term, toast]);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div></div>;
  }
  
  if (!analytics && !loading) {
     return (
        <Card className="glass-effect border-white/10">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white">No Performance Data Yet</h3>
            <p className="text-gray-400 mt-2">Your performance data for the selected term is not available yet. Please check back later.</p>
          </CardContent>
        </Card>
      );
  }

  const myPerformanceData = analytics.student_performance?.[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Performance & Insights</h1>
          <p className="text-gray-400 mt-2">Your personalized dashboard for academic excellence.</p>
        </div>
      </div>

      {myPerformanceData &&
        <Card className="glass-effect border-white/10">
            <CardHeader>
                <CardTitle className="text-white">Term Performance Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="glass-effect p-4 rounded-lg">
                    <p className="text-3xl font-bold text-cyan-400">{myPerformanceData.final_average?.toFixed(1) ?? 'N/A'}</p>
                    <p className="text-sm text-gray-300">Overall Average</p>
                </div>
                <div className="glass-effect p-4 rounded-lg">
                    <p className="text-3xl font-bold text-green-400">{myPerformanceData.rank ?? 'N/A'}</p>
                    <p className="text-sm text-gray-300">Class Rank</p>
                </div>
            </CardContent>
        </Card>
      }

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Subject Performance</CardTitle>
            <CardDescription className="text-gray-400">Your average scores across different subjects.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.subject_performance} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <XAxis type="number" stroke="#888888" domain={[0, 100]} />
                <YAxis type="category" dataKey="subject_name" stroke="#888888" width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#e5e7eb' }} />
                <Legend />
                <Bar dataKey="average_grade" fill="#8884d8" name="Average Grade" background={{ fill: '#eee', opacity: 0.1 }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {insights.length > 0 &&
            <Card className="glass-effect border-white/10 lg:col-span-1">
                <CardHeader>
                    <CardTitle className="text-white flex items-center"><BrainCircuit className="w-6 h-6 mr-2 text-cyan-400"/> Your Personal AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     {insights.map((insight, index) => (
                        <InsightCard key={insight.id} insight={insight} index={index} />
                    ))}
                </CardContent>
            </Card>
        }
      </div>

    </div>
  );
}