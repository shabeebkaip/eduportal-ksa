
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast.js';
import { supabase } from '@/lib/customSupabaseClient.js';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useAcademicYear } from '@/contexts/AcademicYearContext.jsx';

export function useDataManagement(refetchData, admins) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { academicYear } = useAcademicYear();

  const syncStudents = useCallback(async (studentsToSync) => {
    if (!user) return false;
    const { data, error } = await supabase.functions.invoke('sync-students', {
      body: { 
        school_id: user.user_metadata.school_id, 
        academic_year: academicYear,
        students: studentsToSync.map(s => ({
          ...s,
          school_id: user.user_metadata.school_id,
          academic_year: academicYear,
          status: 'Active',
        }))
      },
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Sync Failed', description: error.message });
      return false;
    }
    toast({ title: 'Sync Successful', description: `${data.upsertedCount} students synced, ${data.deactivatedCount} students marked as inactive.` });
    await refetchData();
    return true;
  }, [user, academicYear, toast, refetchData]);

  const addUser = useCallback(async (table, userData) => {
    if (!user) return false;
    const { email, password, name, role } = userData;
    const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
            email,
            password,
            name,
            role,
            school_id: user.user_metadata.school_id
        }
    });

    if (error || data.error) {
        const errorMessage = error?.message || data?.error?.message;
        toast({ variant: 'destructive', title: 'Creation Failed', description: errorMessage });
        return false;
    }
    
    toast({ title: 'User created successfully!' });
    await refetchData();
    return true;
  }, [user, toast, refetchData]);

  const updateUser = useCallback(async (table, id, updateData, authUserId, newRoles) => {
    if (!user) return { success: false };

    if (table === 'teachers' && newRoles && authUserId) {
      const { error: functionError } = await supabase.functions.invoke('update-user-roles', {
        body: { auth_user_id: authUserId, new_roles: newRoles }
      });

      if (functionError) {
        toast({ variant: 'destructive', title: 'Role Update Failed', description: functionError.message });
        return { success: false };
      }
    }
    
    const { error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast({ variant: 'destructive', title: 'Update failed', description: error.message });
      return { success: false };
    }
    
    toast({ title: 'Update Successful' });
    await refetchData();
    return { success: true };
  }, [toast, refetchData, user]);

  const deleteUser = useCallback(async (table, userToDelete) => {
    if (!user) return false;
    if (admins.some(admin => admin.user_id === userToDelete.user_id && admin.role === 'school-admin')) {
      toast({ variant: 'destructive', title: 'Action Denied', description: 'Primary School Admin cannot be deleted.' });
      return;
    }
    
    const { error } = await supabase.rpc('delete_teacher_user', { user_id_to_delete: userToDelete.user_id });
    
    if (error) {
      toast({ variant: 'destructive', title: 'Deletion Failed', description: error.message });
      return;
    }
    
    toast({ title: 'User Deleted Successfully' });
    await refetchData();
  }, [toast, refetchData, admins, user]);

  const addAssignment = useCallback(async (assignmentData) => {
    if (!user) return false;
    const { error } = await supabase.from('teacher_assignments').insert(assignmentData);
    if (error) {
      toast({ variant: 'destructive', title: 'Assignment failed', description: error.message });
      return false;
    }
    toast({ title: 'Assignment added successfully!' });
    await refetchData();
    return true;
  }, [toast, refetchData, user]);

  const deleteAssignment = useCallback(async (assignmentId) => {
    if (!user) return false;
    const { error } = await supabase.from('teacher_assignments').delete().eq('id', assignmentId);
    if (error) {
      toast({ variant: 'destructive', title: 'Deletion failed', description: error.message });
      return false;
    }
    toast({ title: 'Assignment deleted successfully!' });
    await refetchData();
    return true;
  }, [toast, refetchData, user]);

  const addSubject = useCallback(async (subjectData) => {
    if (!user) return { success: false };
    const { error } = await supabase.from('subjects').insert(subjectData);
    if (error) {
      toast({ variant: 'destructive', title: 'Creation failed', description: error.message });
      return { success: false };
    }
    toast({ title: 'Subject created successfully!' });
    await refetchData();
    return { success: true };
  }, [toast, refetchData, user]);

  const updateSubject = useCallback(async (id, subjectData) => {
    if (!user) return { success: false };
    const { error } = await supabase.from('subjects').update(subjectData).eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Update failed', description: error.message });
      return { success: false };
    }
    toast({ title: 'Subject updated successfully!' });
    await refetchData();
    return { success: true };
  }, [toast, refetchData, user]);

  const deleteSubject = useCallback(async (id) => {
    if (!user) return;
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Deletion failed', description: error.message });
    } else {
      toast({ title: 'Subject deleted successfully!' });
      await refetchData();
    }
  }, [toast, refetchData, user]);

  return { syncStudents, addUser, updateUser, deleteUser, addAssignment, deleteAssignment, addSubject, updateSubject, deleteSubject };
}
