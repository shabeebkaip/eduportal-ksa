import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableShimmerWithBadges } from '@/components/ui/table-shimmer';
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

  const handleToggleSchoolStatus = async (school) => {
    const newStatus = school.status === 'Active' ? 'Inactive' : 'Active';
    
    try {
      const { error } = await supabase
        .from('schools')
        .update({ status: newStatus })
        .eq('id', school.id);

      if (error) throw error;

      toast({
        title: newStatus === 'Active' ? "✅ School Activated" : "⚠️ School Deactivated",
        description: `${school.name} has been ${newStatus === 'Active' ? 'activated' : 'deactivated'}.`,
      });
      
      await refetchData();
    } catch (error) {
      console.error('Error toggling school status:', error);
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: error.message,
      });
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Schools Management</h1>
          <p className="text-gray-400 mt-2">View and manage all schools on the platform.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New School
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] glass-effect border-white/10">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white font-bold">Add New School</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter the details for the new school and its primary administrator.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* School Information Section */}
              <div className="space-y-4 bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-white">School Information</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-name" className="text-white text-sm font-medium">
                    School Name <span className="text-red-400">*</span>
                  </Label>
                  <Input 
                    id="school-name" 
                    value={schoolName} 
                    onChange={(e) => setSchoolName(e.target.value)} 
                    placeholder="e.g., Al-Khobar International School"
                    className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-location" className="text-white text-sm font-medium">
                    Location <span className="text-red-400">*</span>
                  </Label>
                  <Input 
                    id="school-location" 
                    value={schoolLocation} 
                    onChange={(e) => setSchoolLocation(e.target.value)} 
                    placeholder="e.g., Riyadh, Saudi Arabia"
                    className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Administrator Information Section */}
              <div className="space-y-4 bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-white">Administrator Information</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-name" className="text-white text-sm font-medium">
                    Full Name <span className="text-red-400">*</span>
                  </Label>
                  <Input 
                    id="admin-name" 
                    value={adminName} 
                    onChange={(e) => setAdminName(e.target.value)} 
                    placeholder="e.g., Ahmed Al-Rahman"
                    className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-white text-sm font-medium">
                    Email Address <span className="text-red-400">*</span>
                  </Label>
                  <Input 
                    id="admin-email" 
                    type="email" 
                    value={adminEmail} 
                    onChange={(e) => setAdminEmail(e.target.value)} 
                    placeholder="admin@school.edu.sa"
                    className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-white text-sm font-medium">
                    Password <span className="text-red-400">*</span>
                  </Label>
                  <Input 
                    id="admin-password" 
                    type="password" 
                    value={adminPassword} 
                    onChange={(e) => setAdminPassword(e.target.value)} 
                    placeholder="Minimum 8 characters"
                    className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                  <div className="flex items-start gap-2 mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-md">
                    <span className="text-blue-400 text-xs">ℹ️</span>
                    <p className="text-xs text-blue-300">The administrator will use this to log in for the first time.</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 pt-4 border-t border-white/10">
              <Button 
                variant="secondary" 
                onClick={() => setOpen(false)}
                className="bg-white/5 hover:bg-white/10 text-white border-white/10"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={handleAddSchool} 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white disabled:opacity-50 min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-pulse">Creating...</span>
                  </>
                ) : (
                  'Create School'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-effect border-white/10">
        <CardContent className="p-0">
          {loading ? (
            <TableShimmerWithBadges rows={5} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-gray-400 font-semibold">Name</TableHead>
                    <TableHead className="text-gray-400 font-semibold">Location</TableHead>
                    <TableHead className="text-gray-400 font-semibold text-center">Students</TableHead>
                    <TableHead className="text-gray-400 font-semibold text-center">Teachers</TableHead>
                    <TableHead className="text-gray-400 font-semibold text-center">Status</TableHead>
                    <TableHead className="text-gray-400 font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => (
                    <TableRow key={school.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-semibold text-white">{school.name}</TableCell>
                      <TableCell className="text-gray-300">{school.location || 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-medium text-sm">
                          {school.students_count || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 font-medium text-sm">
                          {school.teachers_count || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={school.status === 'Active' ? 'default' : 'destructive'}
                          className={school.status === 'Active' ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20' : ''}
                        >
                          {school.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-white/10">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-effect border-white/10">
                            <DropdownMenuItem onClick={() => openEditDialog(school)} className="cursor-pointer">
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleSchoolStatus(school)} 
                              className="cursor-pointer"
                            >
                              {school.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DeleteSchoolDialog school={school} onDeleted={refetchData} />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit School Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-effect border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Edit School</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the school information below.
            </DialogDescription>
          </DialogHeader>
          {editingSchool && (
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-school-name" className="text-white text-sm font-medium">
                  School Name <span className="text-red-400">*</span>
                </Label>
                <Input 
                  id="edit-school-name" 
                  value={editingSchool.name} 
                  onChange={(e) => setEditingSchool({...editingSchool, name: e.target.value})} 
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  placeholder="e.g., Al-Khobar International School"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location" className="text-white text-sm font-medium">
                  Location <span className="text-red-400">*</span>
                </Label>
                <Input 
                  id="edit-location" 
                  value={editingSchool.location} 
                  onChange={(e) => setEditingSchool({...editingSchool, location: e.target.value})} 
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  placeholder="e.g., Riyadh, Saudi Arabia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-white text-sm font-medium">
                  Status <span className="text-red-400">*</span>
                </Label>
                <select
                  id="edit-status"
                  value={editingSchool.status}
                  onChange={(e) => setEditingSchool({...editingSchool, status: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Active" className="bg-gray-900 text-white">Active</option>
                  <option value="Inactive" className="bg-gray-900 text-white">Inactive</option>
                  <option value="Suspended" className="bg-gray-900 text-white">Suspended</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)} className="bg-white/5 hover:bg-white/10 text-white border-white/10">
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleEditSchool} 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update School'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolsManagement;