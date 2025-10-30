import React, { useState } from 'react';
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
import { useToast } from '@/components/ui/use-toast.js';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useData } from '@/contexts/DataContext.jsx';
import { supabase } from '@/lib/customSupabaseClient.js';

export default function AddTeacherDialog({ isOpen, onOpenChange }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const { refetchData } = useData();

  const handleSave = async () => {
    setLoading(true);
    let error;

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
      error = responseData?.error ? { message: responseData.error } : functionError;
    }

    setLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: error.message,
      });
    } else {
      toast({
        title: 'Success!',
        description: `Staff member created. An invitation email has been sent.`,
      });
      refetchData();
      onOpenChange(false);
      setFormData({ name: '', email: '', password: '' });
    }
  };

  const isFormValid = formData.name && formData.email && formData.password;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="gradient-text">Add New Staff Member</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter the new staff member's information. They will be created with a default 'Teacher' role.
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
            />
          </div>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={loading || !isFormValid}
            className="bg-gradient-to-r from-blue-500 to-purple-600"
          >
            {loading ? 'Creating...' : 'Create Staff Member'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}