import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';

const AddEditStudentDialog = ({ isOpen, onOpenChange, user, onSave }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(user ? { ...user } : { first_name: '', last_name: '', student_code: '', password: '', status: 'Active' });
    }
  }, [user, isOpen]);

  const handleSave = async () => {
    if (!formData.student_code || !formData.password || !formData.first_name) {
        // Basic validation
        alert('Please fill in all required fields: First Name, Student Code, and Password.');
        return;
    }
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-white/10 sm:max-w-2xl">
        <DialogHeader><DialogTitle className="text-white">{user ? 'Edit' : 'Add'} Student</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
                <Label className="text-white">Student Code <span className="text-red-500">*</span></Label>
                <Input required value={formData.student_code || ''} onChange={e => setFormData({...formData, student_code: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
                <Label className="text-white">First Name <span className="text-red-500">*</span></Label>
                <Input required value={formData.first_name || ''} onChange={e => setFormData({...formData, first_name: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
                <Label className="text-white">Last Name</Label>
                <Input value={formData.last_name || ''} onChange={e => setFormData({...formData, last_name: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
                <Label className="text-white">Password <span className="text-red-500">*</span></Label>
                <Input required type="password" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2"><Label className="text-white">Academic Year</Label><Input value={formData.academic_year || ''} onChange={e => setFormData({...formData, academic_year: e.target.value})} className="bg-white/5 border-white/10 text-white" /></div>
            <div className="space-y-2"><Label className="text-white">Major</Label><Input value={formData.major || ''} onChange={e => setFormData({...formData, major: e.target.value})} className="bg-white/5 border-white/10 text-white" /></div>
            <div className="space-y-2"><Label className="text-white">Group</Label><Input value={formData.group_desc || ''} onChange={e => setFormData({...formData, group_desc: e.target.value})} className="bg-white/5 border-white/10 text-white" /></div>
            <div className="space-y-2"><Label className="text-white">Class</Label><Input value={formData.class_desc || ''} onChange={e => setFormData({...formData, class_desc: e.target.value})} className="bg-white/5 border-white/10 text-white" /></div>
            <div className="space-y-2"><Label className="text-white">Section</Label><Input value={formData.section_name || ''} onChange={e => setFormData({...formData, section_name: e.target.value})} className="bg-white/5 border-white/10 text-white" /></div>
             <div className="space-y-2">
                <Label className="text-white">Username</Label>
                <Input value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Save'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default AddEditStudentDialog;