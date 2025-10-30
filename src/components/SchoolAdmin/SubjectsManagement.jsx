import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Users, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast.js';
import { useData } from '@/contexts/DataContext.jsx';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function SubjectsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const { toast } = useToast();
  const { subjects, teacherAssignments, addSubject, updateSubject, deleteSubject } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const subjectsWithTeacherCount = useMemo(() => {
    return subjects.map(subject => {
      const uniqueTeacherIds = new Set(
        teacherAssignments
          .filter(assignment => assignment.subject_id === subject.id)
          .map(assignment => assignment.teacher_id)
      );
      return {
        ...subject,
        teacherCount: uniqueTeacherIds.size,
      };
    });
  }, [subjects, teacherAssignments]);

  const filteredSubjects = subjectsWithTeacherCount.filter(subject => 
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject.code && subject.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (subject.category && subject.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSaveSubject = async (formData) => {
    const { id, ...dataToSave } = formData;
    const school_id = user?.user_metadata?.school_id;
    let success = false;

    if (id) {
      ({ success } = await updateSubject(id, dataToSave));
    } else {
      ({ success } = await addSubject({ ...dataToSave, school_id }));
    }

    if (success) {
      setIsAddEditDialogOpen(false);
      setSelectedSubject(null);
    }
  };

  const openAddDialog = () => {
    setSelectedSubject(null);
    setIsAddEditDialogOpen(true);
  };

  const openEditDialog = (subject) => {
    setSelectedSubject(subject);
    setIsAddEditDialogOpen(true);
  };

  const handleDelete = async (subjectId) => {
    await deleteSubject(subjectId);
  };

  const handleViewDetails = (subject) => {
    navigate(`/school-admin/subjects/${subject.id}`);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Core': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Science': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Language': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Social Studies': 'bg-orange-500/20 text-orange-400 border-orange-400/30',
      'Arts': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Subjects Management</h1>
          <p className="text-gray-400 mt-2">Manage subjects, curricula, and teacher assignments</p>
        </div>
        <Button onClick={openAddDialog} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </Button>
      </div>

      <Card className="glass-effect border-white/10">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSubjects.map((subject, index) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-effect border-white/10 card-hover flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-white text-xl">{subject.name}</CardTitle>
                        {subject.category && <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(subject.category)}`}>
                          {subject.category}
                        </span>}
                      </div>
                      <CardDescription className="text-gray-400">{subject.code}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="glass-effect border-white/10">
                        <DropdownMenuItem onClick={() => handleViewDetails(subject)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(subject)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Subject
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(subject.id)}
                          className="text-red-400 focus:text-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Subject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <p className="text-gray-300 text-sm h-12 flex-grow-0">{subject.description}</p>
                    
                  <div className="pt-4 mt-auto border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                       <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300 text-sm">Assigned Teachers</span>
                    </div>
                     <span className="text-white font-semibold">{subject.teacherCount}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <Card className="glass-effect border-white/10">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 text-lg">No subjects found.</div>
            <p className="text-gray-500 mt-2">Try adding a new subject to get started.</p>
          </CardContent>
        </Card>
      )}

      <AddEditSubjectDialog 
        isOpen={isAddEditDialogOpen} 
        onOpenChange={setIsAddEditDialogOpen} 
        subject={selectedSubject} 
        onSave={handleSaveSubject} 
      />
    </div>
  );
}

export const AddEditSubjectDialog = ({ isOpen, onOpenChange, subject, onSave }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(subject ? { ...subject } : { name: '', code: '', category: '', description: '' });
    }
  }, [subject, isOpen]);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-white/10 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">{subject ? 'Edit' : 'Add'} Subject</DialogTitle>
          <DialogDescription className="text-gray-400">
            {subject ? 'Update the subject details.' : 'Create a new subject with curriculum details.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject-name" className="text-white">Subject Name</Label>
              <Input id="subject-name" placeholder="Enter subject name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject-code" className="text-white">Subject Code</Label>
              <Input id="subject-code" placeholder="e.g., MATH101" value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category" className="text-white">Category</Label>
            <Select value={formData.category || ''} onValueChange={value => setFormData({...formData, category: value})}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="glass-effect border-white/10">
                <SelectItem value="Core">Core</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="Language">Language</SelectItem>
                <SelectItem value="Social Studies">Social Studies</SelectItem>
                <SelectItem value="Arts">Arts</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea id="description" placeholder="Enter subject description" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-white/5 border-white/10 text-white" rows={3} />
          </div>
          
          <Button onClick={handleSave} className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
            {subject ? 'Update' : 'Create'} Subject
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};