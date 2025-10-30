import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog.jsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Input } from '@/components/ui/input.jsx';
import { useToast } from '@/components/ui/use-toast.js';

export default function ClassDetailDialog({
  classData,
  isOpen,
  onClose,
  mode,
  onDelete,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
}) {
  const { toast } = useToast();

  if (!classData) return null;

  const handleEdit = () => {
    toast({
      title: "🚧 Feature Not Implemented",
      description: "Editing class details is not yet available.",
    });
  };

  const handleDeleteConfirm = () => {
    onDelete(classData);
    setIsDeleteDialogOpen(false);
    onClose();
  };

  const isEditMode = mode === 'edit';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="glass-effect border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="gradient-text">
              {isEditMode ? 'Edit Class' : 'Class Details'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {isEditMode ? `Editing ${classData.name}` : `Viewing details for ${classData.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-gray-300">Name</Label>
              <Input id="name" value={classData.name} readOnly={!isEditMode} className="col-span-3 bg-white/5 border-white/10" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="major" className="text-right text-gray-300">Major</Label>
              <Input id="major" value={classData.major} readOnly={!isEditMode} className="col-span-3 bg-white/5 border-white/10" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="group" className="text-right text-gray-300">Group</Label>
              <Input id="group" value={classData.group} readOnly={!isEditMode} className="col-span-3 bg-white/5 border-white/10" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="students" className="text-right text-gray-300">Students</Label>
              <Input id="students" value={classData.studentCount} readOnly className="col-span-3 bg-white/5 border-white/10" />
            </div>
          </div>

          <DialogFooter>
            {isEditMode ? (
              <Button onClick={handleEdit} className="bg-gradient-to-r from-blue-500 to-purple-600">Save Changes</Button>
            ) : (
              <Button onClick={onClose} variant="outline">Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="glass-effect border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. Deleting a class is a placeholder action for now. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}