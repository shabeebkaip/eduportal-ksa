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

  const [schoolName, setSchoolName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleAction = () => {
    toast({
      title: "🚧 Feature in Progress",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const handleAddSchool = async () => {
    if (!schoolName || !adminName || !adminEmail || !adminPassword) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all fields to add a new school.",
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
            <DialogContent className="sm:max-w-[425px] glass-effect">
              <DialogHeader>
                <DialogTitle>Add New School</DialogTitle>
                <DialogDescription>
                  Enter the details for the new school and its primary administrator.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="school-name" className="text-right">School Name</Label>
                  <Input id="school-name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="admin-name" className="text-right">Admin Name</Label>
                  <Input id="admin-name" value={adminName} onChange={(e) => setAdminName(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="admin-email" className="text-right">Admin Email</Label>
                  <Input id="admin-email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="admin-password" className="text-right">Password</Label>
                  <Input id="admin-password" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddSchool} disabled={isSubmitting}>
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
                          <DropdownMenuItem onClick={handleAction}>Edit</DropdownMenuItem>
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
    </div>
  );
};

export default SchoolsManagement;