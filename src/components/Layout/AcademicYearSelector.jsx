import React, { useState } from 'react';
import { Calendar, Plus, Check } from 'lucide-react';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function AcademicYearSelector() {
  const { academicYear, availableYears, changeAcademicYear, addAcademicYear, loading } = useAcademicYear();
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newYear, setNewYear] = useState('');

  const handleAddNewYear = async () => {
    if (newYear.trim()) {
      await addAcademicYear(newYear.trim());
      setIsAddDialogOpen(false);
      setNewYear('');
    }
  };

  const isSchoolAdmin = user?.user_metadata?.role === 'school-admin';

  if (loading) {
    return (
      <div className="w-48 h-10 bg-slate-800 rounded-md animate-pulse" />
    );
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <Select value={academicYear || ''} onValueChange={changeAcademicYear} disabled={availableYears.length === 0}>
          <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent className="glass-effect border-white/10">
            {availableYears.map(year => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
            {isSchoolAdmin && availableYears.length > 0 && <SelectSeparator />}
            {isSchoolAdmin && (
              <div 
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground hover:bg-white/10"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2 absolute left-2" />
                Add New Year
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="glass-effect border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Academic Year</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the new academic year (e.g., 2024-2025).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="e.g., 2024-2025"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-white/20 text-white hover:bg-white/10">Cancel</Button>
            <Button onClick={handleAddNewYear} className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Check className="w-4 h-4 mr-2" />
              Add and Select
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}