import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookCopy, Users, Clock, BookOpen, Eye } from 'lucide-react';
import RosterDialog from '@/components/Teacher/RosterDialog.jsx';

const StatCard = ({ title, value, icon, color }) => (
  <Card className="glass-effect border-white/10">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </CardContent>
  </Card>
);

export default function TeacherOverview() {
  const { user } = useAuth();
  const { academicYear } = useAcademicYear();
  const { toast } = useToast();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [selectedAssignmentForRoster, setSelectedAssignmentForRoster] = useState(null);

  const fetchData = useCallback(async () => {
    if (!user || !academicYear) return;
    setLoading(true);

    try {
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (teacherError) throw teacherError;
      if (!teacherData) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find teacher profile.' });
        return;
      }

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('teacher_assignments')
        .select('*, subjects(name, code)')
        .eq('teacher_id', teacherData.id)
        .eq('academic_year', academicYear);

      if (assignmentsError) throw assignmentsError;

      const formattedAssignments = assignmentsData.map(a => ({ ...a, subject_name: a.subjects.name, subject_code: a.subjects.code }));
      setAssignments(formattedAssignments);

    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to fetch dashboard data', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [user, academicYear, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    const totalClasses = assignments.length;
    const totalSubjects = new Set(assignments.map(a => a.subject_id)).size;
    const totalPeriods = assignments.reduce((sum, a) => sum + (a.periods_per_week || 0), 0);
    return { totalClasses, totalSubjects, totalPeriods };
  }, [assignments]);

  const handleViewRoster = (assignment) => {
    setSelectedAssignmentForRoster(assignment);
    setIsRosterOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div></div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Assigned Classes" value={stats.totalClasses} icon={<Users className="h-4 w-4 text-gray-400" />} color="text-blue-400" />
        <StatCard title="Unique Subjects" value={stats.totalSubjects} icon={<BookCopy className="h-4 w-4 text-gray-400" />} color="text-green-400" />
        <StatCard title="Total Weekly Periods" value={stats.totalPeriods} icon={<Clock className="h-4 w-4 text-gray-400" />} color="text-yellow-400" />
      </div>

      <Card className="glass-effect border-white/10">
        <CardHeader>
          <CardTitle className="text-white">My Assignments for {academicYear}</CardTitle>
          <CardDescription className="text-gray-400">Here are all the classes and subjects assigned to you for the current academic year.</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((assignment) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-slate-800/50 border-white/10 hover:border-white/20 transition-all">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-300 flex items-center">
                        <BookOpen className="w-5 h-5 mr-3" />
                        {assignment.subject_name}
                      </CardTitle>
                      <CardDescription className="text-gray-500 font-mono">{assignment.subject_code}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-gray-300">
                        <p className="font-semibold">Class:</p>
                        <p>{assignment.major} / {assignment.group_desc} / {assignment.class_desc} - Section {assignment.section_name}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-300">
                          <Clock className="w-4 h-4 mr-2 text-green-400" />
                          <span>{assignment.periods_per_week} periods/week</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleViewRoster(assignment)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Roster
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400">You have no assignments for the {academicYear} academic year.</p>
              <p className="text-gray-500 text-sm mt-2">Please contact your school administrator if you believe this is an error.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedAssignmentForRoster && (
        <RosterDialog
          isOpen={isRosterOpen}
          onOpenChange={setIsRosterOpen}
          assignment={selectedAssignmentForRoster}
        />
      )}
    </motion.div>
  );
}