import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GraduationCap, BookOpen, AlertTriangle, BookUser } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext.jsx';
import { useAcademicYear } from '@/contexts/AcademicYearContext.jsx';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeacherAssignmentsPanel({ teacher }) {
  const { students, subjects, teacherAssignments, addAssignment, deleteAssignment } = useData();
  const { academicYear } = useAcademicYear();
  const { toast } = useToast();
  
  const [newAssignment, setNewAssignment] = useState({ class_desc: '', section_name: '', subject_id: '' });
  const [isAdding, setIsAdding] = useState(false);

  const currentTeacherAssignments = useMemo(() => {
    return teacherAssignments.filter(a => a.teacher_id === teacher.id && a.academic_year === academicYear);
  }, [teacherAssignments, teacher.id, academicYear]);

  const classStructure = useMemo(() => {
    const classDescs = [...new Set(students.map(s => s.class_desc).filter(Boolean))].sort();
    const sectionsByClass = classDescs.reduce((acc, classDesc) => {
      acc[classDesc] = [...new Set(students.filter(s => s.class_desc === classDesc).map(s => s.section_name).filter(Boolean))].sort();
      return acc;
    }, {});
    return { classDescs, sectionsByClass };
  }, [students]);
  
  const handleAddAssignment = async () => {
    if (!newAssignment.class_desc || !newAssignment.section_name || !newAssignment.subject_id) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a class, section, and subject.' });
        return;
    }
    
    const student = students.find(s => s.class_desc === newAssignment.class_desc && s.section_name === newAssignment.section_name);
    if (!student) {
        toast({ variant: 'destructive', title: 'Invalid Selection', description: 'Could not match selection to a valid student group.' });
        return;
    }

    const assignmentData = {
        teacher_id: teacher.id,
        class_desc: newAssignment.class_desc,
        section_name: newAssignment.section_name,
        subject_id: parseInt(newAssignment.subject_id),
        academic_year: academicYear,
        major: student.major,
        group_desc: student.group_desc,
    };
    
    const success = await addAssignment(assignmentData);
    if (success) {
      setNewAssignment({ class_desc: '', section_name: '', subject_id: '' });
      setIsAdding(false);
    }
  };
  
  return (
    <Card className="glass-effect border-white/10">
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
            <CardTitle className="text-white">Teaching Assignments for {academicYear}</CardTitle>
            <CardDescription className="text-gray-400">Assign classes and subjects this teacher is responsible for in the current academic year.</CardDescription>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white">
          <Plus className="w-4 h-4 mr-2" /> {isAdding ? 'Cancel' : 'New Assignment'}
        </Button>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {isAdding && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-800/50 p-4 rounded-lg border border-white/10 mb-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2 col-span-1">
                      <Select value={newAssignment.class_desc} onValueChange={val => setNewAssignment({...newAssignment, class_desc: val, section_name: ''})}>
                          <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select Class" /></SelectTrigger>
                          <SelectContent className="glass-effect border-white/10">{classStructure.classDescs.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2 col-span-1">
                       <Select value={newAssignment.section_name} onValueChange={val => setNewAssignment({...newAssignment, section_name: val})} disabled={!newAssignment.class_desc}>
                          <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select Section" /></SelectTrigger>
                          <SelectContent className="glass-effect border-white/10">{(classStructure.sectionsByClass[newAssignment.class_desc] || []).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                  </div>
                   <div className="space-y-2 col-span-1">
                       <Select value={newAssignment.subject_id} onValueChange={val => setNewAssignment({...newAssignment, subject_id: val})}>
                          <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                          <SelectContent className="glass-effect border-white/10">{subjects.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                  </div>
                  <Button onClick={handleAddAssignment} className="bg-gradient-to-r from-green-500 to-cyan-500 col-span-1">Add</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          <AnimatePresence>
            {currentTeacherAssignments.map((assignment, index) => (
              <motion.div
                key={assignment.id}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-md bg-black/20"
              >
                <div className="flex items-center space-x-4">
                    <BookUser className="w-5 h-5 text-purple-400" />
                    <div>
                        <p className="font-semibold text-white">{assignment.subjects?.name}</p>
                        <p className="text-sm text-gray-400">{assignment.class_desc} - {assignment.section_name}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteAssignment(assignment.id)} className="text-red-500 hover:text-red-400 hover:bg-red-900/20">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          {currentTeacherAssignments.length === 0 && !isAdding && (
            <div className="text-center py-10 px-4 border-2 border-dashed border-white/10 rounded-lg">
                <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                <h3 className="mt-2 text-lg font-semibold text-white">No Assignments Found</h3>
                <p className="mt-1 text-sm text-gray-400">This teacher has no classes or subjects assigned for the {academicYear} academic year.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}