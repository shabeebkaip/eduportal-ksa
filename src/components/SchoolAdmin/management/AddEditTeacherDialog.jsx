import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient.js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useData } from '@/contexts/DataContext.jsx';

export default function AddEditTeacherDialog({ isOpen, onOpenChange, user, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    status: 'Active',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const { refetchData } = useData();

  const isEditMode = Boolean(user);

  useEffect(() => {
    if (isOpen && isEditMode) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        status: user.status || 'Active',
        password: '',
      });
    } else if (isOpen && !isEditMode) {
      setFormData({
        name: '',
        email: '',
        password: '',
        status: 'Active',
      });
    }
  }, [isOpen, user, isEditMode]);

  const handleSave = async () => {
    setLoading(true);
    let error;

    if (isEditMode) {
      const { error: updateError } = await supabase
        .from('teachers')
        .update({
          name: formData.name,
          status: formData.status,
        })
        .eq('id', user.id);
      error = updateError;
    } else {
      const school_id = authUser?.user_metadata?.school_id;
      
      if (!school_id) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not identify your school. Please try again.',
        });
        setLoading(false);
        return;
      }

      const { data: responseData, error: functionError } = await supabase.functions.invoke('create-user', {
        body: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          school_id: school_id,
          role: 'teacher'
        }
      });

      if (functionError) {
        // The error from the edge function might be in the response body
        error = responseData?.error ? { message: responseData.error } : functionError;
      }
    }

    setLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error.message,
      });
    } else {
      toast({
        title: 'Success!',
        description: `Teacher ${isEditMode ? 'updated' : 'created'}. An invitation email has been sent.`,
      });
      refetchData();
      onOpenChange(false);
    }
  };

  const isFormValid = formData.name && formData.email && (isEditMode || formData.password);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="gradient-text">{isEditMode ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditMode ? `Update details for ${user.name}.` : 'Enter the new teacher\'s information.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-white/5 border-white/10"
              readOnly={isEditMode}
            />
          </div>
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="password"className="text-gray-300">Temporary Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
          )}
           {isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-300">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/10">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
           )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={loading || !isFormValid}
            className="bg-gradient-to-r from-blue-500 to-purple-600"
          >
            {loading ? 'Saving...' : 'Save Teacher'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}