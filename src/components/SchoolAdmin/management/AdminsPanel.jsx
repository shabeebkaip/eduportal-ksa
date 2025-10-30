import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext.jsx';
import AnimateItems from '@/components/SchoolAdmin/management/UserCard';

export default function AdminsPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { admins, deleteAdmin } = useData();

  const filteredAdmins = admins.filter(u =>
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || u.status.toLowerCase() === filterStatus)
  );

  const handleDeleteUser = async (userToDelete) => {
    await deleteAdmin(userToDelete.id, userToDelete.user_id);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Manage Admin Staff</h2>
      
      <Card className="glass-effect border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search administrators..."
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
      
      <AnimateItems items={filteredAdmins} userType="admins" onDelete={handleDeleteUser} />
      
      {filteredAdmins.length === 0 && (
        <Card className="glass-effect border-white/10">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 text-lg">No administrators found.</div>
            <p className="text-gray-500 mt-2">Admins are created when a school is created. Other roles can be assigned in 'Role Assignments'.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}