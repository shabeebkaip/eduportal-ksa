import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { MultiSelect } from '@/components/ui/multi-select';

const ROLES = {
  'academic-director': { scope: 'major', label: 'Assign Major(s)' },
  'head-of-section': { scope: 'group', label: 'Assign Group(s)' },
  'subject-coordinator': { scope: 'subject', label: 'Assign Subject(s)' },
};

export default function AddEditAssignmentDialog({ isOpen, onOpenChange, onSave, assignment, allStaff, classStructure }) {
  const [formData, setFormData] = useState({
    user_id: '',
    role: '',
    secondary_role: '',
    majors: [],
    groups: [],
    classes: [],
    sections: [],
    subject_id: null,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isEditMode = useMemo(() => assignment && assignment.length > 0, [assignment]);

  const availableStaff = useMemo(() => {
    const assignedUserIds = new Set(allStaff.filter(s => s.role && s.role !== 'teacher' && s.role !== 'school-admin').map(s => s.user_id));
    if (isEditMode) {
      assignedUserIds.delete(assignment[0].user_id);
    }
    return allStaff.filter(s => !assignedUserIds.has(s.user_id));
  }, [allStaff, isEditMode, assignment]);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        const firstAssignment = assignment[0];
        const majors = [...new Set(assignment.map(a => a.major).filter(Boolean))];
        const groups = [...new Set(assignment.map(a => a.group_desc).filter(Boolean))];
        const classes = [...new Set(assignment.map(a => a.class_desc).filter(Boolean))];
        const sections = [...new Set(assignment.map(a => a.section_name).filter(Boolean))];
        
        setFormData({
          user_id: firstAssignment.user_id,
          role: firstAssignment.admins.role,
          secondary_role: firstAssignment.admins.secondary_role || '',
          majors,
          groups,
          classes,
          sections,
          subject_id: firstAssignment.subject_id || null,
        });
      } else {
        setFormData({
          user_id: '',
          role: '',
          secondary_role: '',
          majors: [],
          groups: [],
          classes: [],
          sections: [],
          subject_id: null,
        });
      }
    }
  }, [isOpen, isEditMode, assignment]);

  const handleSave = async () => {
    setLoading(true);
    const success = await onSave(formData);
    setLoading(false);
    if (success) {
      onOpenChange(false);
    }
  };

  const currentRoleInfo = ROLES[formData.role];

  const filteredGroups = useMemo(() => {
    if (!formData.majors.length) return [];
    return [...new Set(classStructure.groups.filter(g => formData.majors.includes(g.major)).map(g => g.group_desc))];
  }, [formData.majors, classStructure.groups]);

  const filteredClasses = useMemo(() => {
    if (!formData.groups.length) return [];
    return [...new Set(classStructure.classDescs.filter(c => formData.majors.includes(c.major) && formData.groups.includes(c.group_desc)).map(c => c.class_desc))];
  }, [formData.majors, formData.groups, classStructure.classDescs]);

  const filteredSections = useMemo(() => {
    if (!formData.classes.length) return [];
    return [...new Set(classStructure.sections.filter(s => formData.majors.includes(s.major) && formData.groups.includes(s.group_desc) && formData.classes.includes(s.class_desc)).map(s => s.section_name))];
  }, [formData.majors, formData.groups, formData.classes, classStructure.sections]);

  const isFormValid = formData.user_id && formData.role;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="gradient-text">{isEditMode ? 'Edit Role Assignment' : 'New Role Assignment'}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Assign a specific administrative role and its scope to a staff member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user_id" className="text-gray-300">Existing Staff Member</Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                disabled={isEditMode}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select a staff member" />
                </SelectTrigger>
                <SelectContent className="glass-effect border-white/10">
                  {availableStaff.map(staff => (
                    <SelectItem key={staff.user_id} value={staff.user_id}>
                      {staff.name} ({staff.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-gray-300">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value, majors: [], groups: [], classes: [], sections: [], subject_id: null })}
            >
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="glass-effect border-white/10">
                <SelectItem value="academic-director">Academic Director</SelectItem>
                <SelectItem value="head-of-section">Head of Section</SelectItem>
                <SelectItem value="subject-coordinator">Subject Coordinator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {currentRoleInfo?.scope === 'major' && (
            <div className="space-y-2">
              <Label htmlFor="majors" className="text-gray-300">{currentRoleInfo.label}</Label>
              <MultiSelect
                options={classStructure.majors.map(m => ({ value: m, label: m }))}
                selected={formData.majors}
                onChange={(selected) => setFormData({ ...formData, majors: selected })}
                placeholder="Select majors..."
              />
            </div>
          )}

          {currentRoleInfo?.scope === 'group' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="majors" className="text-gray-300">Assign Major(s)</Label>
                <MultiSelect
                  options={classStructure.majors.map(m => ({ value: m, label: m }))}
                  selected={formData.majors}
                  onChange={(selected) => setFormData({ ...formData, majors: selected, groups: [] })}
                  placeholder="Select majors first..."
                />
              </div>
              {formData.majors.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="groups" className="text-gray-300">{currentRoleInfo.label}</Label>
                  <MultiSelect
                    options={filteredGroups.map(g => ({ value: g, label: g }))}
                    selected={formData.groups}
                    onChange={(selected) => setFormData({ ...formData, groups: selected })}
                    placeholder="Select groups..."
                  />
                </div>
              )}
            </>
          )}

          {currentRoleInfo?.scope === 'subject' && (
            <div className="space-y-2">
              <Label htmlFor="subject_id" className="text-gray-300">{currentRoleInfo.label}</Label>
              <Select
                value={formData.subject_id}
                onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent className="glass-effect border-white/10">
                  {classStructure.subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
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
            {loading ? 'Saving...' : 'Save Assignment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}