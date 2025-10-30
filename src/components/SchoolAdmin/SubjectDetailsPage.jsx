import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, BookOpen, Clock, Users, BarChart3 } from 'lucide-react';

const StatCard = ({ icon, label, value, color }) => {
  const Icon = icon;
  return (
    <Card className="glass-effect border-white/10 card-hover">
      <CardContent className="p-4 flex items-center space-x-4">
        <div className={`p-3 rounded-full bg-${color}-500/20`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function SubjectDetailsPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { subjects, teachers, students, teacherAssignments, loading } = useData();

  const [selectedMajor, setSelectedMajor] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');

  const subject = useMemo(() => subjects.find(s => s.id.toString() === subjectId), [subjectId, subjects]);

  const assignmentsForSubject = useMemo(() => {
    return teacherAssignments
      .filter(a => a.subject_id.toString() === subjectId)
      .map(a => {
        const teacher = teachers.find(t => t.id === a.teacher_id);
        return {
          ...a,
          teacher_name: teacher?.name || 'Unknown Teacher'
        };
      });
  }, [subjectId, teacherAssignments, teachers]);
  
  const classStructure = useMemo(() => {
    const structure = { majors: new Set(['all']), groups: {}, classDescs: {}, sections: {} };
    assignmentsForSubject.forEach(a => {
      structure.majors.add(a.major);
      if (!structure.groups[a.major]) structure.groups[a.major] = new Set(['all']);
      structure.groups[a.major].add(a.group_desc);

      if (!structure.classDescs[a.group_desc]) structure.classDescs[a.group_desc] = new Set(['all']);
      structure.classDescs[a.group_desc].add(a.class_desc);
      
      if (!structure.sections[a.class_desc]) structure.sections[a.class_desc] = new Set(['all']);
      structure.sections[a.class_desc].add(a.section_name);
    });
    return {
      majors: Array.from(structure.majors).filter(Boolean),
      groups: selectedMajor !== 'all' ? Array.from(structure.groups[selectedMajor] || new Set(['all'])).filter(Boolean) : [],
      classDescs: selectedGroup !== 'all' ? Array.from(structure.classDescs[selectedGroup] || new Set(['all'])).filter(Boolean) : [],
      sections: selectedClass !== 'all' ? Array.from(structure.sections[selectedClass] || new Set(['all'])).filter(Boolean) : [],
    };
  }, [assignmentsForSubject, selectedMajor, selectedGroup, selectedClass]);

  const filteredAssignments = useMemo(() => {
    return assignmentsForSubject.filter(a => 
      (selectedMajor === 'all' || a.major === selectedMajor) &&
      (selectedGroup === 'all' || a.group_desc === selectedGroup) &&
      (selectedClass === 'all' || a.class_desc === selectedClass) &&
      (selectedSection === 'all' || a.section_name === selectedSection)
    );
  }, [assignmentsForSubject, selectedMajor, selectedGroup, selectedClass, selectedSection]);

  const stats = useMemo(() => {
    const uniqueTeachers = new Set(assignmentsForSubject.map(a => a.teacher_id));
    const totalPeriods = assignmentsForSubject.reduce((sum, a) => sum + (a.periods_per_week || 0), 0);
    const assignedClasses = new Set(assignmentsForSubject.map(a => `${a.class_desc}-${a.section_name}`));
    return {
      teacherCount: uniqueTeachers.size,
      periodCount: totalPeriods,
      classCount: assignedClasses.size
    };
  }, [assignmentsForSubject]);


  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div></div>;
  if (!subject) return <div className="text-white text-center p-8">Subject not found. It might have been deleted or an error occurred.</div>;

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate('/school-admin/subjects')} className="border-white/20 text-white hover:bg-white/10">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Subjects
      </Button>

      <Card className="glass-effect border-white/10">
        <CardHeader>
          <CardTitle className="gradient-text text-3xl">{subject.name}</CardTitle>
          <CardDescription className="text-gray-400">{subject.code} - {subject.description}</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Users} label="Assigned Teachers" value={stats.teacherCount} color="blue" />
        <StatCard icon={BarChart3} label="Total Classes" value={stats.classCount} color="purple" />
        <StatCard icon={Clock} label="Total Periods/Week" value={stats.periodCount} color="green" />
      </div>

      <Card className="glass-effect border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Teacher Assignments Report</CardTitle>
          <CardDescription className="text-gray-400">Filter to see which teachers are assigned to specific classes for this subject.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={selectedMajor} onValueChange={(v) => { setSelectedMajor(v); setSelectedGroup('all'); setSelectedClass('all'); setSelectedSection('all'); }}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select Major" /></SelectTrigger>
                <SelectContent className="glass-effect border-white/10">{classStructure.majors.map(m => <SelectItem key={m} value={m}>{m === 'all' ? 'All Majors' : m}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={selectedGroup} onValueChange={(v) => { setSelectedGroup(v); setSelectedClass('all'); setSelectedSection('all'); }} disabled={selectedMajor === 'all'}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select Group" /></SelectTrigger>
                <SelectContent className="glass-effect border-white/10">{classStructure.groups.map(g => <SelectItem key={g} value={g}>{g === 'all' ? 'All Groups' : g}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setSelectedSection('all'); }} disabled={selectedGroup === 'all'}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select Class" /></SelectTrigger>
                <SelectContent className="glass-effect border-white/10">{classStructure.classDescs.map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'All Classes' : c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={selectedSection} onValueChange={setSelectedSection} disabled={selectedClass === 'all'}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select Section" /></SelectTrigger>
                <SelectContent className="glass-effect border-white/10">{classStructure.sections.map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All Sections' : s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            
             <div className="space-y-4 pt-4">
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map(assignment => (
                  <div key={assignment.id} className="flex items-start justify-between p-4 rounded-lg bg-white/5 border border-white/10 transition-all hover:border-white/20">
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-white text-lg flex items-center"><User className="w-5 h-5 mr-3 text-green-400" />{assignment.teacher_name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-300 pl-8">
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-blue-400" />
                          <span>{assignment.major} / {assignment.group_desc} / {assignment.class_desc} - {assignment.section_name}</span>
                        </div>
                        <div className="flex items-center">
                           <Clock className="w-4 h-4 mr-2 text-purple-400" />
                          <span>{assignment.periods_per_week} periods/week</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No assignments match the current filters.</p>
              )}
            </div>

        </CardContent>
      </Card>
    </div>
  );
}