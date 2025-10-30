import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext.jsx';
import AnimateItems from '@/components/SchoolAdmin/management/UserCard';
import AddTeacherDialog from '@/components/SchoolAdmin/management/AddTeacherDialog';

export default function TeachersPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { teachers, deleteUser } = useData();
  const navigate = useNavigate();

  const filteredTeachers = teachers.filter(u =>
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || u.username || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || u.status.toLowerCase() === filterStatus)
  );

  const handleDeleteUser = async (userToDelete) => {
    await deleteUser('teachers', userToDelete);
  };

  const handleEditUser = (userToEdit) => {
    navigate(`/school-admin/users/teachers/edit/${userToEdit.id}`);
  };
  
  const handleAddUser = () => {
    setIsAddDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Manage Staff</h2>
        <Button onClick={handleAddUser} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />Add Staff
        </Button>
      </div>
      
      <Card className="glass-effect border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search staff by name or email..."
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
      
      <AnimateItems items={filteredTeachers} userType="teachers" onEdit={handleEditUser} onDelete={handleDeleteUser} />
      
      {filteredTeachers.length === 0 && (
        <Card className="glass-effect border-white/10">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 text-lg">No staff members found.</div>
          </CardContent>
        </Card>
      )}

      <AddTeacherDialog 
        isOpen={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </div>
  );
}