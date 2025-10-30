import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { useTerm } from '@/contexts/TermContext';
import { useToast } from '@/components/ui/use-toast.js';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Lightbulb, AlertTriangle, TrendingUp, TrendingDown, GitCompareArrows } from 'lucide-react';
import { Users } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useClassStructure } from '@/hooks/useClassStructure.js';

const InsightCard = ({ insight, index }) => {
  const categoryMap = {
    'Student At-Risk': { icon: <TrendingDown className="w-6 h-6 text-red-400" />, color: 'border-red-500/50 bg-red-500/10', titleColor: 'text-red-300' },
    'Top Achiever': { icon: <TrendingUp className="w-6 h-6 text-green-400" />, color: 'border-green-500/50 bg-green-500/10', titleColor: 'text-green-300' },
    'Class Performance': { icon: <Users className="w-6 h-6 text-blue-400" />, color: 'border-blue-500/50 bg-blue-500/10', titleColor: 'text-blue-300' },
    'Comparative Analysis': { icon: <GitCompareArrows className="w-6 h-6 text-purple-400" />, color: 'border-purple-500/50 bg-purple-500/10', titleColor: 'text-purple-300' },
    'Curriculum Hotspot': { icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />, color: 'border-yellow-500/50 bg-yellow-500/10', titleColor: 'text-yellow-300' },
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
       {insight.details && (
        <div className="text-xs text-gray-400 pt-2 border-t border-white/10">
          {Object.entries(insight.details).map(([key, value]) => (
            <p key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {value}</p>
          ))}
        </div>
      )}
    </motion.div>
  );
};


export default function AIInsights() {
  const { user } = useAuth();
  const { academicYear } = useAcademicYear();
  const { term } = useTerm();
  const { toast } = useToast();
  const { students } = useData();

  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState([]);
  const [filters, setFilters] = useState({
    major: 'all',
    group_desc: 'all',
    class_desc: 'all',
    section_name: 'all'
  });
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { majors, getGroups, getClassDescs } = useClassStructure(students);
  
  const availableGroups = useMemo(() => getGroups(filters.major), [filters.major, getGroups]);
  const availableClasses = useMemo(() => getClassDescs(filters.major, filters.group_desc), [filters.major, filters.group_desc, getClassDescs]);
  
  // This part needs to be re-evaluated as sections are part of dynamicClasses, not a separate filter level in useClassStructure
  const availableSections = useMemo(() => {
    if (!students || filters.class_desc === 'all') return ['all'];
    const relevantStudents = students.filter(s => 
        (filters.major === 'all' || s.major === filters.major) &&
        (filters.group_desc === 'all' || s.group_desc === filters.group_desc) &&
        (s.class_desc === filters.class_desc)
    );
    return ['all', ...[...new Set(relevantStudents.map(s => s.section_name).filter(Boolean))].sort()];
  }, [students, filters.major, filters.group_desc, filters.class_desc]);


  useEffect(() => {
    setFilters(prev => ({...prev, group_desc: 'all', class_desc: 'all', section_name: 'all'}));
  }, [filters.major]);

  useEffect(() => {
    setFilters(prev => ({...prev, class_desc: 'all', section_name: 'all'}));
  }, [filters.group_desc]);
  
  useEffect(() => {
    setFilters(prev => ({...prev, section_name: 'all'}));
  }, [filters.class_desc]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const generateInsights = async () => {
    if (!user || !academicYear || !term) {
      toast({ variant: 'destructive', title: 'Missing required context', description: 'Please ensure an academic year and term are selected.' });
      return;
    }
    setLoading(true);
    setInsights([]);
    try {
      const requestBody = {
        school_id: user.user_metadata.school_id,
        academic_year: academicYear,
        term_id: term.id,
        user_id: user.id,
        major: filters.major === 'all' ? null : filters.major,
        group_desc: filters.group_desc === 'all' ? null : filters.group_desc,
        class_desc: filters.class_desc === 'all' ? null : filters.class_desc,
        section_name: filters.section_name === 'all' ? null : filters.section_name,
      };

      const { data, error } = await supabase.functions.invoke('generate-ai-insights', {
        body: JSON.stringify(requestBody)
      });

      if (error) throw error;
      setInsights(Array.isArray(data) ? data : []);

    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to generate AI insights', description: error.message });
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredInsights = useMemo(() => {
    if (categoryFilter === 'all') return insights;
    return insights.filter(i => i.category === categoryFilter);
  }, [insights, categoryFilter]);

  const insightCategories = useMemo(() => {
      const categories = new Set(insights.map(i => i.category));
      return ['all', ...Array.from(categories)];
  }, [insights]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Futuristic AI Insights</h1>
          <p className="text-gray-400 mt-2">Unlocking deep, personalized, and predictive academic intelligence.</p>
        </div>
      </div>

      <Card className="glass-effect border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Analysis Filters</CardTitle>
          <CardDescription className="text-gray-400">Drill down to generate highly specific and meaningful insights.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={filters.major} onValueChange={v => handleFilterChange('major', v)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="All Majors"/></SelectTrigger>
              <SelectContent className="glass-effect border-white/10">{majors.map(m => <SelectItem key={m} value={m}>{m === 'all' ? 'All Majors' : m}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filters.group_desc} onValueChange={v => handleFilterChange('group_desc', v)} disabled={availableGroups.length <= 1}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="All Groups" /></SelectTrigger>
              <SelectContent className="glass-effect border-white/10">{availableGroups.map(g => <SelectItem key={g} value={g}>{g === 'all' ? 'All Groups' : g}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filters.class_desc} onValueChange={v => handleFilterChange('class_desc', v)} disabled={availableClasses.length <= 1}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="All Classes" /></SelectTrigger>
              <SelectContent className="glass-effect border-white/10">{availableClasses.map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'All Classes' : c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filters.section_name} onValueChange={v => handleFilterChange('section_name', v)} disabled={availableSections.length <= 1}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="All Sections" /></SelectTrigger>
              <SelectContent className="glass-effect border-white/10">{availableSections.map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All Sections' : s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={generateInsights} disabled={loading} className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-600">
            <BrainCircuit className="w-4 h-4 mr-2" />
            {loading ? 'Analyzing...' : 'Generate Insights'}
          </Button>
        </CardContent>
      </Card>

      {insights.length > 0 && (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {insightCategories.map(cat => (
                    <Button key={cat} variant={categoryFilter === cat ? 'default' : 'outline'} onClick={() => setCategoryFilter(cat)} className="text-white border-white/20 hover:bg-white/10 capitalize">
                      {cat.replace(/_/g, ' ')}
                    </Button>
                ))}
            </div>
            <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredInsights.map((insight, index) => (
                        <InsightCard key={insight.id} insight={insight} index={index} />
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
      )}

      {!loading && insights.length === 0 && (
        <Card className="glass-effect border-white/10">
          <CardContent className="p-12 text-center">
            <BrainCircuit className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white">Ready for Advanced Intelligence?</h3>
            <p className="text-gray-400 mt-2">Select your filters and click "Generate Insights" to unleash the power of AI analysis.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}