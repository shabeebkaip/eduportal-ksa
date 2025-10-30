import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext.jsx';
import ClassDetailDialog from '@/components/SchoolAdmin/management/ClassDetailDialog.jsx';
import { useClassStructure } from '@/hooks/useClassStructure.js';

export default function ClassesManagement() {
  const { toast } = useToast();
  const { students } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedClassDesc, setSelectedClassDesc] = useState('all');

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedClassForDetail, setSelectedClassForDetail] = useState(null);
  const [dialogMode, setDialogMode] = useState('view');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { majors, getGroups, getClassDescs, dynamicClasses } = useClassStructure(students);

  const availableGroups = useMemo(() => getGroups(selectedMajor), [selectedMajor, getGroups]);
  const availableClassDescs = useMemo(() => getClassDescs(selectedMajor, selectedGroup), [selectedMajor, selectedGroup, getClassDescs]);

  useEffect(() => {
    setSelectedGroup('all');
    setSelectedClassDesc('all');
  }, [selectedMajor]);

  useEffect(() => {
    setSelectedClassDesc('all');
  }, [selectedGroup]);


  const filteredClasses = useMemo(() => {
    return dynamicClasses.filter(cls => {
      const searchMatch = cls.name.toLowerCase().includes(searchTerm.toLowerCase());
      const majorMatch = selectedMajor === 'all' || cls.major === selectedMajor;
      const groupMatch = selectedGroup === 'all' || cls.group === selectedGroup;
      const classDescMatch = selectedClassDesc === 'all' || cls.class === selectedClassDesc;
      return searchMatch && majorMatch && groupMatch && classDescMatch;
    });
  }, [dynamicClasses, searchTerm, selectedMajor, selectedGroup, selectedClassDesc]);

  const handleViewDetails = (cls) => {
    setSelectedClassForDetail(cls);
    setDialogMode('view');
    setIsDetailDialogOpen(true);
  };

  const handleEditClass = (cls) => {
    setSelectedClassForDetail(cls);
    setDialogMode('edit');
    setIsDetailDialogOpen(true);
  };

  const handleDeleteClass = (cls) => {
    setSelectedClassForDetail(cls);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteClass = (cls) => {
    toast({
      title: "🗑️ Delete Class",
      description: `Placeholder: Simulating deletion of class ${cls.name}. This feature is not fully implemented.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Classes Management</h1>
          <p className="text-gray-400 mt-2">Manage classes, sections, and assignments</p>
        </div>
      </div>

      <Card className="glass-effect border-white/10">
        <CardContent className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search classes by name or section..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedMajor} onValueChange={setSelectedMajor}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select Major" /></SelectTrigger>
              <SelectContent className="glass-effect border-white/10">
                {majors.map(m => <SelectItem key={m} value={m}>{m === 'all' ? 'All Majors' : m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white" disabled={availableGroups.length <= 1}><SelectValue placeholder="Select Group" /></SelectTrigger>
              <SelectContent className="glass-effect border-white/10">
                {availableGroups.map(g => <SelectItem key={g} value={g}>{g === 'all' ? 'All Groups' : g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedClassDesc} onValueChange={setSelectedClassDesc}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white" disabled={availableClassDescs.length <= 1}><SelectValue placeholder="Select Class" /></SelectTrigger>
              <SelectContent className="glass-effect border-white/10">
                {availableClassDescs.map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'All Classes' : c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClasses.map((cls, index) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="glass-effect border-white/10 card-hover">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-xl">{cls.name}</CardTitle>
                    <CardDescription className="text-gray-400">{cls.major} / {cls.group}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass-effect border-white/10">
                      <DropdownMenuItem onClick={() => handleViewDetails(cls)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditClass(cls)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Class
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClass(cls)}
                        className="text-red-400 focus:text-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Class
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">Students</span>
                  </div>
                  <span className="text-white font-semibold">{cls.studentCount}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <Card className="glass-effect border-white/10">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 text-lg">No classes found for the selected filters.</div>
            <p className="text-gray-500 mt-2">Try adjusting your filters or check your student data.</p>
          </CardContent>
        </Card>
      )}

      <ClassDetailDialog
        classData={selectedClassForDetail}
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        mode={dialogMode}
        onDelete={confirmDeleteClass}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
      />
    </div>
  );
}