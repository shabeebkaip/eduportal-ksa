import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreVertical, Trash2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Checkbox } from '@/components/ui/checkbox';

const DeleteSchoolDialog = ({ school, onDeleted }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleDeleteData = async () => {
    setLoading(true);
    toast({ title: "🛑 Deletion Process Started", description: `Deleting all data for ${school.name}.` });
    try {
      const { error } = await supabase.functions.invoke('delete-school-data', {
        body: { school_id: school.id }
      });
      if (error) throw error;
      
      toast({ title: "✅ School Data Deleted", description: `All data for ${school.name} has been permanently removed.` });
      onDeleted();
      setOpen(false);

    } catch (error) {
      toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const isDeleteButtonDisabled = loading || !isConfirmed || confirmationText !== school.name;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete School
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="glass-effect">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-500"><AlertTriangle className="mr-2"/>Delete School: {school.name}</DialogTitle>
          <DialogDescription>
            This action is irreversible and will permanently delete all data associated with this school, including all user accounts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox id={`confirm-check-${school.id}`} checked={isConfirmed} onCheckedChange={setIsConfirmed} />
            <Label htmlFor={`confirm-check-${school.id}`} className="text-sm font-medium leading-none">
              I understand this action is permanent.
            </Label>
          </div>
          <div>
            <Label htmlFor={`confirm-school-name-${school.id}`}>To confirm, type the school's name: <span className="font-bold text-red-400">{school.name}</span></Label>
            <Input 
              id={`confirm-school-name-${school.id}`}
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="mt-2"
              placeholder="Type school name here"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteData} variant="destructive" disabled={isDeleteButtonDisabled}>
            {loading ? 'Deleting...' : 'Permanently Delete School'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SchoolsManagement = () => {
  const { schools, loading, refetchData } = useData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);

  const [schoolName, setSchoolName] = useState('');
  const [schoolLocation, setSchoolLocation] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const openEditDialog = (school) => {
    setEditingSchool({
      id: school.id,
      name: school.name,
      location: school.location || '',
      status: school.status || 'Active'
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSchool = async () => {
    if (!editingSchool.name) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "School name is required.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('schools')
        .update({
          name: editingSchool.name,
          location: editingSchool.location,
          status: editingSchool.status
        })
        .eq('id', editingSchool.id);

      if (error) throw error;

      toast({
        title: "✅ School Updated",
        description: `${editingSchool.name} has been successfully updated.`,
      });
      
      await refetchData();
      setIsEditDialogOpen(false);
      setEditingSchool(null);
    } catch (error) {
      console.error('Error updating school:', error);
      toast({
        variant: "destructive",
        title: "Failed to update school",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSchool = async () => {
    if (!schoolName || !schoolLocation || !adminName || !adminEmail || !adminPassword) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all required fields (*) to add a new school.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('create-school-and-admin', {
        body: {
          school_name: schoolName,
          admin_name: adminName,
          admin_email: adminEmail,
          admin_password: adminPassword,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "School Created!",
        description: `${schoolName} and its administrator have been successfully created.`,
      });
      await refetchData();
      setOpen(false);
      // Reset form
      setSchoolName('');
      setSchoolLocation('');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create school",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Schools Management</CardTitle>
            <CardDescription>View and manage all schools on the platform.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New School
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass-effect">
              <DialogHeader>
                <DialogTitle className="text-xl">Add New School</DialogTitle>
                <DialogDescription>
                  Enter the details for the new school and its primary administrator.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                {/* School Information Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-300 border-b border-white/10 pb-2">School Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="school-name">School Name *</Label>
                    <Input 
                      id="school-name" 
                      value={schoolName} 
                      onChange={(e) => setSchoolName(e.target.value)} 
                      placeholder="e.g., Al-Khobar International School"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school-location">Location *</Label>
                    <Input 
                      id="school-location" 
                      value={schoolLocation} 
                      onChange={(e) => setSchoolLocation(e.target.value)} 
                      placeholder="e.g., Riyadh, Saudi Arabia"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Administrator Information Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-300 border-b border-white/10 pb-2">Administrator Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="admin-name">Full Name *</Label>
                    <Input 
                      id="admin-name" 
                      value={adminName} 
                      onChange={(e) => setAdminName(e.target.value)} 
                      placeholder="e.g., Ahmed Al-Rahman"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email Address *</Label>
                    <Input 
                      id="admin-email" 
                      type="email" 
                      value={adminEmail} 
                      onChange={(e) => setAdminEmail(e.target.value)} 
                      placeholder="admin@school.edu.sa"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password *</Label>
                    <Input 
                      id="admin-password" 
                      type="password" 
                      value={adminPassword} 
                      onChange={(e) => setAdminPassword(e.target.value)} 
                      placeholder="Minimum 8 characters"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400">The administrator will use this to log in for the first time.</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  onClick={handleAddSchool} 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isSubmitting ? 'Creating...' : 'Create School'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground">Loading schools...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Teachers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>{school.location || 'N/A'}</TableCell>
                    <TableCell>{school.students_count || 0}</TableCell>
                    <TableCell>{school.teachers_count || 0}</TableCell>
                    <TableCell>
                      <Badge variant={school.status === 'Active' ? 'default' : 'destructive'}>
                        {school.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => openEditDialog(school)}>Edit</DropdownMenuItem>
                          <DeleteSchoolDialog school={school} onDeleted={refetchData} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit School Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] glass-effect">
          <DialogHeader>
            <DialogTitle>Edit School</DialogTitle>
            <DialogDescription>
              Update the school information below.
            </DialogDescription>
          </DialogHeader>
          {editingSchool && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-school-name" className="text-right">School Name</Label>
                <Input 
                  id="edit-school-name" 
                  value={editingSchool.name} 
                  onChange={(e) => setEditingSchool({...editingSchool, name: e.target.value})} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-location" className="text-right">Location</Label>
                <Input 
                  id="edit-location" 
                  value={editingSchool.location} 
                  onChange={(e) => setEditingSchool({...editingSchool, location: e.target.value})} 
                  className="col-span-3" 
                  placeholder="e.g., Riyadh, Saudi Arabia"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">Status</Label>
                <select
                  id="edit-status"
                  value={editingSchool.status}
                  onChange={(e) => setEditingSchool({...editingSchool, status: e.target.value})}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleEditSchool} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update School'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolsManagement;