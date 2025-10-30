import React, { useState } from 'react';
import { Plus, Search, Filter, UploadCloud } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast.js';
import { useData } from '@/contexts/DataContext.jsx';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useAcademicYear } from '@/contexts/AcademicYearContext.jsx';
import AnimateItems from '@/components/SchoolAdmin/management/UserCard';
import AddEditStudentDialog from '@/components/SchoolAdmin/management/AddEditStudentDialog';
import BulkUploadDialog from '@/components/SchoolAdmin/management/BulkUploadDialog';
import { supabase } from '@/lib/customSupabaseClient.js';

export default function StudentsPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { toast } = useToast();
  const { students, addUser, updateUser, deleteUser, refetchData, refetchAvailableYears } = useData();
  const { user } = useAuth();
  const { academicYear } = useAcademicYear();

  const filteredStudents = students.filter(u =>
    (`${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) || (u.student_code || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || u.status.toLowerCase() === filterStatus)
  );
  
  const handleSaveUser = async (formData) => {
    const { id, ...dataToSave } = formData;
    const school_id = user?.user_metadata?.school_id;
    let success = false;
    
    if (id) {
      ({ success } = await updateUser('students', id, dataToSave));
    } else {
      ({ success } = await addUser('students', { ...dataToSave, school_id }));
    }
    
    if (success) {
      setIsAddEditDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    await deleteUser('students', userToDelete);
  };

  const handleBulkUpload = async (data) => {
    const school_id = user?.user_metadata?.school_id;
    if (!school_id) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not determine school ID.' });
      return;
    }

    const formattedData = data.map(row => {
      const studentCode = row.student_code || row.UserName || `${row.E_Child_Name}_${row.E_Family_Name}_${Math.random().toString(36).substring(2, 9)}`;
      return {
        school_id,
        student_code: studentCode,
        academic_year: row.Academic_Year || academicYear,
        major: row.E_Major_Desc,
        group_desc: row.E_Group_Desc,
        class_desc: row.E_Class_Desc,
        section_name: row.E_Section_Name,
        first_name: row.E_Child_Name || '',
        last_name: row.E_Family_Name || '',
        father_name: row.E_Father_Name,
        username: row.UserName || null,
        password: row.Password || 'password123',
        father_email: row.Father_Email,
        family_username: row.Family_UserName,
        family_password: row.Family_Password,
        father_phone1: row.FatherPhone1,
        father_phone2: row.FatherPhone2,
        mother_phone1: row.MotherPhone1,
        open_balance: parseFloat(row['Open Balance']) || null,
        total_tuition_fees: parseFloat(row['Total Tution Fees']) || null,
        total_tuition_fees_vat: parseFloat(row['Total Tution Fees (+VAT)']) || null,
        tuition_fees_balance: parseFloat(row['Tution Fees Balance']) || null,
        transportation_fees: parseFloat(row['Transportion']) || null,
        other_fees: parseFloat(row['Other']) || null,
        total_balance: parseFloat(row['TOTAL_Balance']) || null,
        status: 'Active',
      };
    });

    if (formattedData.length > 0) {
      const { data: responseData, error } = await supabase.functions.invoke('sync-students', {
        body: { school_id, students: formattedData, academic_year: academicYear },
      });

      if (error) {
        toast({ variant: 'destructive', title: 'Sync Failed', description: error.message });
      } else {
        toast({ title: 'Sync Successful', description: `Processed ${formattedData.length} records. Check logs for details.` });
        refetchData();
        refetchAvailableYears();
      }
    } else {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'No valid data found to upload. Please check your CSV file.' });
    }
  };

  const openAddDialog = () => { setSelectedUser(null); setIsAddEditDialogOpen(true); };
  const openEditDialog = (userToEdit) => { setSelectedUser(userToEdit); setIsAddEditDialogOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Manage Students</h2>
          <p className="text-gray-400 mt-1">For academic year: <span className="text-white font-semibold">{academicYear || 'N/A'}</span></p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsBulkUploadOpen(true)} variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <UploadCloud className="w-4 h-4 mr-2" />Bulk Upload
          </Button>
          <Button onClick={openAddDialog} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />Add Student
          </Button>
        </div>
      </div>
      
      <Card className="glass-effect border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-effect border-white/10">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <AnimateItems items={filteredStudents} userType="students" onEdit={openEditDialog} onDelete={handleDeleteUser} />
      
      {filteredStudents.length === 0 && (
        <Card className="glass-effect border-white/10">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 text-lg">No students found for this academic year.</div>
          </CardContent>
        </Card>
      )}

      <AddEditStudentDialog isOpen={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen} user={selectedUser} onSave={handleSaveUser} />
      <BulkUploadDialog isOpen={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen} userType="students" onUpload={handleBulkUpload} />
    </div>
  );
}