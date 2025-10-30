import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Briefcase, GraduationCap } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import ScopeSelector from '@/components/SchoolAdmin/management/ScopeSelector';
import TeacherAssignmentsPanel from '@/components/SchoolAdmin/management/TeacherAssignmentsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ALL_ROLES = [
  { value: 'academic-director', label: 'Academic Director', scope: 'major', scopeLabel: 'Assign Major(s)' },
  { value: 'head-of-section', label: 'Head of Section', scope: 'section', scopeLabel: 'Assign Section(s)' },
  { value: 'subject-coordinator', label: 'Subject Coordinator', scope: 'subject', scopeLabel: 'Assign Subject(s)' },
];

export default function EditTeacherPage() {
  const { id: teacherIdParam } = useParams();
  const teacherId = parseInt(teacherIdParam, 10);
  const navigate = useNavigate();
  const { teachers, students, subjects, loading, updateUser } = useData();
  
  const [teacher, setTeacher] = useState(null);
  const [assignedAdminRoles, setAssignedAdminRoles] = useState([]);
  const [assignments, setAssignments] = useState({});

  useEffect(() => {
    const foundTeacher = teachers.find(t => t.id === teacherId);
    if (foundTeacher) {
      setTeacher({ ...foundTeacher });
      const adminRoles = (Array.isArray(foundTeacher.role) ? foundTeacher.role : []).filter(r => r !== 'teacher');
      setAssignedAdminRoles(adminRoles);
      setAssignments(foundTeacher.assignments || {});
    }
  }, [teacherId, teachers]);
  
  const classStructure = useMemo(() => {
    const majors = [...new Set(students.map(s => s.major).filter(Boolean))];
    const groups = [...new Set(students.map(s => s.group_desc).filter(Boolean))];
    const classDescs = [...new Set(students.map(s => s.class_desc).filter(Boolean))];
    const sections = [...new Set(students.map(s => s.section_name).filter(Boolean))];
    return { majors, groups, classDescs, sections, subjects, allStudents: students };
  }, [students, subjects]);

  const handleSaveAll = async () => {
    const rolesToSave = [...new Set(['teacher', ...assignedAdminRoles])];

    const teacherData = {
      name: teacher.name,
      status: teacher.status,
      role: rolesToSave,
      assignments: assignments,
    };
    
    await updateUser('teachers', teacher.id, teacherData, teacher.user_id, rolesToSave);
    navigate('/school-admin/users');
  };
  
  const handleRoleChange = (selectedRoleKeys) => {
    const newAssignments = {};

    selectedRoleKeys.forEach(roleKey => {
      if (assignments[roleKey]) {
        newAssignments[roleKey] = assignments[roleKey];
      } else {
        const roleInfo = ALL_ROLES.find(r => r.value === roleKey);
        if (roleInfo?.scope === 'subject') {
          newAssignments[roleKey] = { subject_id: null };
        } else {
          newAssignments[roleKey] = { majors: [] };
        }
      }
    });

    setAssignedAdminRoles(selectedRoleKeys);
    setAssignments(newAssignments);
  };
  
  const handleAssignmentChange = (roleKey, newAssignment) => {
    setAssignments(prev => ({
      ...prev,
      [roleKey]: newAssignment
    }));
  };

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div></div>;
  if (!teacher) return <div className="text-white text-center">Teacher not found.</div>;

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate('/school-admin/users')} className="border-white/20 text-white hover:bg-white/10">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Users
      </Button>

      <Card className="glass-effect border-white/10">
        <CardHeader>
          <CardTitle className="gradient-text text-3xl">Manage {teacher.name}</CardTitle>
          <CardDescription className="text-gray-400">Edit staff member's information, assign administrative roles, and manage teaching assignments.</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border-white/10 h-12">
            <TabsTrigger value="profile"><User className="w-5 h-5 mr-2" />Profile & Roles</TabsTrigger>
            <TabsTrigger value="assignments"><Briefcase className="w-5 h-5 mr-2" />Teaching Assignments</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <Card className="glass-effect border-white/10">
            <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white">Full Name</Label>
                    <Input value={teacher.name || ''} onChange={e => setTeacher({ ...teacher, name: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Email Address</Label>
                    <Input type="email" value={teacher.email || ''} readOnly className="bg-white/5 border-white/10 text-white cursor-not-allowed" />
                  </div>
                   <div className="space-y-2">
                      <Label className="text-white">Status</Label>
                      <Select value={teacher.status || 'Active'} onValueChange={(value) => setTeacher({...teacher, status: value})}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue/></SelectTrigger>
                          <SelectContent className="glass-effect border-white/10">
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                      </Select>
                   </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Role & Scope Assignment</h3>
                  <p className="text-sm text-gray-400 mb-4">A staff member is always a 'Teacher' by default. You can add additional administrative roles.</p>
                  <div className="space-y-2 mb-6">
                    <Label className="text-gray-300">Administrative Roles</Label>
                     <MultiSelect
                        options={ALL_ROLES.map(r => ({ value: r.value, label: r.label }))}
                        selected={assignedAdminRoles}
                        onChange={handleRoleChange}
                        placeholder="Add administrative roles..."
                      />
                  </div>

                  {assignedAdminRoles.length > 0 && (
                    <div className="space-y-4 rounded-lg bg-slate-800/50 p-4 border border-white/10">
                      <h4 className="text-md font-semibold text-white">Configure Role Scopes</h4>
                      {assignedAdminRoles.map(roleKey => {
                        const roleInfo = ALL_ROLES.find(r => r.value === roleKey);
                        if (!roleInfo) return null;

                        return (
                          <div key={roleKey} className="p-3 border-l-4 border-purple-500 bg-black/20 rounded-r-md">
                            <Label className="font-semibold text-purple-300">{roleInfo.label}</Label>
                             {roleInfo.scope === 'subject' ? (
                                <div className="mt-2">
                                  <Select
                                    value={assignments[roleKey]?.subject_id || ''}
                                    onValueChange={(value) => handleAssignmentChange(roleKey, { subject_id: value })}
                                  >
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                      <SelectValue placeholder={`Select subject for ${roleInfo.label}...`} />
                                    </SelectTrigger>
                                    <SelectContent className="glass-effect border-white/10">
                                      {classStructure.subjects.map(subject => (
                                        <SelectItem key={subject.id} value={subject.id.toString()}>
                                          {subject.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                             ) : (
                                <ScopeSelector
                                  classStructure={classStructure}
                                  value={assignments[roleKey] || { majors: [] }}
                                  onChange={(newVal) => handleAssignmentChange(roleKey, newVal)}
                                />
                             )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveAll} className="bg-gradient-to-r from-green-500 to-cyan-600">Save Profile & Roles</Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assignments" className="mt-6">
            <TeacherAssignmentsPanel teacher={teacher} />
        </TabsContent>
      </Tabs>
    </div>
  );
}