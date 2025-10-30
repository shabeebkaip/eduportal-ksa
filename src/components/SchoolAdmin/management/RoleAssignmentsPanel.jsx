import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AddEditAssignmentDialog from '@/components/SchoolAdmin/management/role_assignments/AddEditAssignmentDialog';
import AssignmentList from '@/components/SchoolAdmin/management/role_assignments/AssignmentList';
import _ from 'lodash';

export default function RoleAssignmentsPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { admins, teachers, students, subjects, refetchData } = useData();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  const allStaff = useMemo(() => {
    const staffMap = new Map();
    teachers.forEach(teacher => {
      if(teacher.user_id) {
        staffMap.set(teacher.user_id, {
          user_id: teacher.user_id,
          name: teacher.name,
          email: teacher.email,
          role: 'teacher'
        });
      }
    });
  
    admins.forEach(admin => {
      if(admin.user_id) {
        staffMap.set(admin.user_id, {
          user_id: admin.user_id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          secondary_role: admin.secondary_role
        });
      }
    });
  
    return Array.from(staffMap.values());
  }, [admins, teachers]);

  const classStructure = useMemo(() => {
    const majors = [...new Set(students.map(s => s.major).filter(Boolean))];
    const groups = students.map(s => ({ major: s.major, group_desc: s.group_desc })).filter(s => s.group_desc);
    const classDescs = students.map(s => ({ major: s.major, group_desc: s.group_desc, class_desc: s.class_desc })).filter(s => s.class_desc);
    const sections = students.map(s => ({ major: s.major, group_desc: s.group_desc, class_desc: s.class_desc, section_name: s.section_name })).filter(s => s.section_name);
    return { majors, groups, classDescs, sections, subjects };
  }, [students, subjects]);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const schoolId = user.user_metadata.school_id;
      
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('user_assignments')
        .select('*')
        .eq('school_id', schoolId);
      if (assignmentsError) throw assignmentsError;

      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('school_id', schoolId);
      if (subjectsError) throw subjectsError;

      const staffMap = new Map(allStaff.map(s => [s.user_id, s]));
      const subjectsMap = new Map(subjectsData.map(subject => [subject.id, subject]));

      const combinedData = assignmentsData.map(assignment => ({
        ...assignment,
        admins: staffMap.get(assignment.user_id) || { name: 'Unknown Staff', role: 'N/A' },
        subjects: subjectsMap.get(assignment.subject_id) || null
      }));

      setAssignments(combinedData);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error fetching assignments', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [user, toast, allStaff]);
  
  useEffect(() => {
    if (allStaff.length > 0) {
      fetchAssignments();
    }
  }, [fetchAssignments, allStaff]);

  const handleSaveAssignment = async (formData) => {
    const finalUserId = formData.user_id;

    const { error: deleteError } = await supabase.from('user_assignments').delete().eq('user_id', finalUserId);
    if(deleteError){
        toast({ variant: 'destructive', title: 'Save failed', description: `Failed to clear old assignments: ${deleteError.message}` });
        return false;
    }

    const assignmentsToInsert = [];
    const baseAssignment = {
        user_id: finalUserId,
        school_id: user.user_metadata.school_id,
        subject_id: formData.subject_id,
    };

    if (formData.majors && formData.majors.length > 0) {
        formData.majors.forEach(major => {
            if (formData.groups && formData.groups.length > 0) {
                formData.groups.forEach(group_desc => {
                    if (formData.classes && formData.classes.length > 0) {
                        formData.classes.forEach(class_desc => {
                            if (formData.sections && formData.sections.length > 0) {
                                formData.sections.forEach(section => assignmentsToInsert.push({ ...baseAssignment, major, group_desc, class_desc, section_name: section }));
                            } else {
                                assignmentsToInsert.push({ ...baseAssignment, major, group_desc, class_desc });
                            }
                        });
                    } else {
                        assignmentsToInsert.push({ ...baseAssignment, major, group_desc });
                    }
                });
            } else {
                assignmentsToInsert.push({ ...baseAssignment, major });
            }
        });
    } else if (formData.role !== 'teacher') {
        assignmentsToInsert.push(baseAssignment);
    }
    
    if (assignmentsToInsert.length > 0) {
        const { error: upsertError } = await supabase.from('user_assignments').insert(assignmentsToInsert);
        if (upsertError) {
            toast({ variant: 'destructive', title: 'Save failed', description: `Failed to save new assignments: ${upsertError.message}` });
            return false;
        }
    }
    
    const staffMember = allStaff.find(s => s.user_id === finalUserId);

    const { error: updateAdminError } = await supabase
        .from('admins')
        .upsert({ 
          user_id: finalUserId, 
          role: formData.role,
          secondary_role: formData.secondary_role,
          name: staffMember?.name,
          email: staffMember?.email,
          school_id: user.user_metadata.school_id,
          status: 'Active'
        }, { onConflict: 'user_id' });

    if (updateAdminError) {
        toast({ variant: 'destructive', title: 'Save failed', description: `Failed to update admin role: ${updateAdminError.message}` });
        return false;
    } else {
        toast({ title: 'Success', description: 'Role assignment saved.' });
        setIsDialogOpen(false);
        setSelectedAssignment(null);
        await refetchData();
        return true;
    }
  };
  
  const handleDeleteAssignment = async (assignment) => {
    const { error } = await supabase.from('user_assignments').delete().eq('user_id', assignment.user_id);
    if (error) {
        toast({ variant: 'destructive', title: 'Delete failed', description: error.message });
    } else {
        await supabase.from('admins').update({ role: 'teacher', secondary_role: null }).eq('user_id', assignment.user_id);
        toast({ title: 'Success', description: 'Assignment deleted. Role reverted to Teacher.' });
        await refetchData();
    }
  };
  
  const handleEditAssignment = (assignment) => {
    const fullAssignment = assignments.filter(a => a.user_id === assignment.user_id);
    setSelectedAssignment(fullAssignment);
    setIsDialogOpen(true);
  }
  
  const groupedAssignments = useMemo(() => {
      return _.groupBy(assignments.filter(a => a.admins && a.admins.role !== 'teacher'), 'user_id');
  }, [assignments]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Role Assignments</h2>
        <Button onClick={() => { setSelectedAssignment(null); setIsDialogOpen(true); }} className="bg-gradient-to-r from-blue-500 to-purple-600">
          <Plus className="w-4 h-4 mr-2" />Assign Role
        </Button>
      </div>

      <AssignmentList 
        assignments={Object.values(groupedAssignments)}
        loading={loading}
        onEdit={handleEditAssignment}
        onDelete={handleDeleteAssignment}
        allStaff={allStaff}
      />
      
      {Object.values(groupedAssignments).length === 0 && !loading && (
        <Card className="glass-effect border-white/10">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 text-lg">No role assignments found.</div>
            <p className="text-gray-500 mt-2">Click "Assign Role" to create a new assignment.</p>
          </CardContent>
        </Card>
      )}

      <AddEditAssignmentDialog 
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedAssignment(null);
          setIsDialogOpen(open);
        }}
        onSave={handleSaveAssignment}
        assignment={selectedAssignment}
        allStaff={allStaff}
        classStructure={classStructure}
      />
    </div>
  );
}