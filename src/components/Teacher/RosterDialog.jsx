import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { useToast } from '@/components/ui/use-toast';
import { User, Search } from 'lucide-react';

export default function RosterDialog({ isOpen, onOpenChange, assignment }) {
  const { user } = useAuth();
  const { academicYear } = useAcademicYear();
  const { toast } = useToast();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRoster = useCallback(async () => {
    if (!isOpen || !assignment || !user || !academicYear) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, first_name, last_name, student_code')
        .eq('school_id', user.user_metadata.school_id)
        .eq('academic_year', academicYear)
        .eq('major', assignment.major)
        .eq('group_desc', assignment.group_desc)
        .eq('class_desc', assignment.class_desc)
        .eq('section_name', assignment.section_name)
        .order('first_name', { ascending: true });

      if (error) throw error;
      setStudents(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to fetch roster',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [isOpen, assignment, user, academicYear, toast]);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    return students.filter(student =>
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-white/10 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Class Roster</DialogTitle>
          {assignment && (
            <DialogDescription className="text-gray-400">
              Students in {assignment.major} / {assignment.group_desc} / {assignment.class_desc} - Section {assignment.section_name}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 text-white pl-10"
            />
          </div>
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
              </div>
            ) : filteredStudents.length > 0 ? (
              <ul className="space-y-2">
                {filteredStudents.map((student) => (
                  <li key={student.id} className="flex items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="p-2 bg-blue-500/20 rounded-full mr-4">
                      <User className="w-5 h-5 text-blue-300" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-white">{student.first_name} {student.last_name}</p>
                      <p className="text-sm text-gray-400 font-mono">{student.student_code}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400">No students found for this class.</p>
                {searchTerm && <p className="text-gray-500 text-sm mt-1">Try adjusting your search.</p>}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}