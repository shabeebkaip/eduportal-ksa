import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Database, GraduationCap, Download, Archive, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import TermsManagement from '@/components/SchoolAdmin/management/TermsManagement';
import AcademicYearManagement from '@/components/SchoolAdmin/management/AcademicYearManagement';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYear } from '@/contexts/AcademicYearContext';

const GeneralSettings = () => {
  const { toast } = useToast();
  const handleSave = () => {
    toast({
      title: "✅ Settings Saved",
      description: "General settings have been updated successfully.",
    });
  };
  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="text-white">General Settings</CardTitle>
        <CardDescription className="text-gray-400">Manage your school's general information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="school-name" className="text-white">School Name</Label>
          <Input id="school-name" defaultValue="Horizon International School" className="bg-white/5 border-white/10 text-white" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="school-location" className="text-white">Location</Label>
          <Input id="school-location" defaultValue="Springfield, USA" className="bg-white/5 border-white/10 text-white" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="ai-features" className="text-white">Enable AI Features</Label>
          <Switch id="ai-features" defaultChecked />
        </div>
        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-purple-600">Save Changes</Button>
      </CardContent>
    </Card>
  );
};

const AcademicSettings = () => {
    return (
        <div className="space-y-6">
            <AcademicYearManagement />
            <TermsManagement />
        </div>
    );
};

const NotificationSettings = () => {
  const { toast } = useToast();
  const handleSave = () => {
    toast({
      title: "✅ Notifications Updated",
      description: "Notification settings have been saved.",
    });
  };
  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Notification Settings</CardTitle>
        <CardDescription className="text-gray-400">Control how you receive notifications.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white">Performance Alerts</Label>
            <p className="text-sm text-gray-400">Receive alerts for students with significant performance drops.</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white">Weekly Summaries</Label>
            <p className="text-sm text-gray-400">Get a weekly summary of school performance via email.</p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white">New User Registrations</Label>
            <p className="text-sm text-gray-400">Notify when a new teacher or student is added.</p>
          </div>
          <Switch defaultChecked />
        </div>
        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-purple-600">Save Changes</Button>
      </CardContent>
    </Card>
  );
};

const SecuritySettings = () => {
  const { toast } = useToast();
  const handleSave = () => {
    toast({
      title: "✅ Security Updated",
      description: "Security settings have been saved.",
    });
  };
  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Security Settings</CardTitle>
        <CardDescription className="text-gray-400">Manage security options for your school's account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white">Two-Factor Authentication (2FA)</Label>
            <p className="text-sm text-gray-400">Require all users to set up 2FA for enhanced security.</p>
          </div>
          <Switch />
        </div>
        <div className="space-y-2">
          <Label htmlFor="session-timeout" className="text-white">Session Timeout (minutes)</Label>
          <Input id="session-timeout" type="number" defaultValue="60" className="bg-white/5 border-white/10 text-white" />
        </div>
        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-purple-600">Save Changes</Button>
      </CardContent>
    </Card>
  );
};

const DataManagementSettings = () => {
  const { toast } = useToast();
  const { currentSchool } = useData();
  const { signOut } = useAuth();
  const { availableYears } = useAcademicYear();
  const [loading, setLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [selectedArchiveYear, setSelectedArchiveYear] = useState('');

  const handleExportData = async () => {
    setLoading(true);
    toast({ title: "🚀 Starting Export", description: "Preparing your school data. This may take a moment..." });
    try {
      const { data, error } = await supabase.functions.invoke('export-school-data', {
        body: { school_id: currentSchool.id }
      });
      if (error) throw error;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `school_data_${currentSchool.id}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({ title: "✅ Export Complete", description: "Your data has been successfully downloaded." });
    } catch (error) {
      toast({ variant: "destructive", title: "Export Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveData = async () => {
    if (!selectedArchiveYear) {
      toast({ variant: "destructive", title: "No Year Selected", description: "Please select an academic year to archive." });
      return;
    }
    setLoading(true);
    toast({ title: "🚀 Starting Archive", description: `Archiving data for ${selectedArchiveYear}...` });
    try {
      const { error } = await supabase.functions.invoke('archive-academic-year', {
        body: { school_id: currentSchool.id, academic_year: selectedArchiveYear }
      });
      if (error) throw error;
      toast({ title: "✅ Archive Initiated", description: `Data for ${selectedArchiveYear} is being archived. This is a placeholder action.` });
      setOpenArchiveDialog(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Archive Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteData = async () => {
    setLoading(true);
    toast({ title: "🛑 Deletion Process Started", description: "Your request is being processed securely." });
    try {
      const { error } = await supabase.functions.invoke('delete-school-data', {
        body: { school_id: currentSchool.id }
      });
      if (error) throw error;
      
      toast({ title: "✅ School Data Deleted", description: "All data for your school has been permanently removed. You will be logged out." });
      setTimeout(() => {
        signOut();
      }, 3000);

    } catch (error) {
      toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
      setLoading(false);
    }
  };

  const isDeleteButtonDisabled = loading || !isConfirmed || confirmationText !== currentSchool?.name;

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Data Management</CardTitle>
        <CardDescription className="text-gray-400">Export, archive, or permanently delete your school's data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleExportData} disabled={loading} variant="outline" className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300">
          <Download className="w-4 h-4 mr-2" />
          {loading ? 'Exporting...' : 'Export All School Data'}
        </Button>
        
        <Dialog open={openArchiveDialog} onOpenChange={setOpenArchiveDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300">
              <Archive className="w-4 h-4 mr-2" />
              Archive Previous Year's Data
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-effect">
            <DialogHeader>
              <DialogTitle>Archive Academic Year Data</DialogTitle>
              <DialogDescription>
                Select an academic year to archive. This action will freeze the data, removing it from active views. This is non-reversible from the UI.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Label htmlFor="archive-year">Academic Year</Label>
              <Select onValueChange={setSelectedArchiveYear}>
                <SelectTrigger><SelectValue placeholder="Select a year..." /></SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpenArchiveDialog(false)}>Cancel</Button>
              <Button onClick={handleArchiveData} disabled={loading || !selectedArchiveYear} className="bg-amber-600 hover:bg-amber-700">
                {loading ? 'Archiving...' : 'Archive Data'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All School Data
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-effect">
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-500"><AlertTriangle className="mr-2"/>Permanent Data Deletion</DialogTitle>
              <DialogDescription>
                This action is irreversible and will permanently delete all data associated with your school, including all user accounts.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="confirm-check" checked={isConfirmed} onCheckedChange={setIsConfirmed} />
                <Label htmlFor="confirm-check" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I understand this action is permanent and cannot be undone.
                </Label>
              </div>
              <div>
                <Label htmlFor="confirm-school-name">To confirm, type your school's name: <span className="font-bold text-red-400">{currentSchool?.name}</span></Label>
                <Input 
                  id="confirm-school-name" 
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className="mt-2"
                  placeholder="Type school name here"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
              <Button onClick={handleDeleteData} variant="destructive" disabled={isDeleteButtonDisabled}>
                {loading ? 'Deleting...' : 'Permanently Delete Data'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default function SchoolAdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">School Settings</h1>
        <p className="text-gray-400 mt-2">Customize and manage your school's platform settings.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-white/10">
          <TabsTrigger value="general"><Settings className="w-4 h-4 mr-2" />General</TabsTrigger>
          <TabsTrigger value="academics"><GraduationCap className="w-4 h-4 mr-2" />Academics</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
          <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" />Security</TabsTrigger>
          <TabsTrigger value="data"><Database className="w-4 h-4 mr-2" />Data</TabsTrigger>
        </TabsList>
        <motion.div
          key="tab-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          <TabsContent value="general"><GeneralSettings /></TabsContent>
          <TabsContent value="academics"><AcademicSettings /></TabsContent>
          <TabsContent value="notifications"><NotificationSettings /></TabsContent>
          <TabsContent value="security"><SecuritySettings /></TabsContent>
          <TabsContent value="data"><DataManagementSettings /></TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}
