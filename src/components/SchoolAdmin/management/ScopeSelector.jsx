import React from 'react';
import { MultiSelect } from '@/components/ui/multi-select';
import { Label } from '@/components/ui/label';

const ScopeSelector = ({ classStructure, value, onChange }) => {
  const { allStudents } = classStructure;

  const handleMajorChange = (selectedMajors) => {
    const newMajors = selectedMajors.map(majorName => {
      const existingMajor = (value.majors || []).find(m => m.name === majorName);
      return existingMajor || { name: majorName, groups: [] };
    });
    onChange({ majors: newMajors });
  };

  const handleGroupChange = (majorName, selectedGroups) => {
    const newMajors = (value.majors || []).map(major => {
      if (major.name === majorName) {
        const newGroups = selectedGroups.map(groupName => {
          const existingGroup = (major.groups || []).find(g => g.name === groupName);
          return existingGroup || { name: groupName, classes: [] };
        });
        return { ...major, groups: newGroups };
      }
      return major;
    });
    onChange({ majors: newMajors });
  };

  const handleClassChange = (majorName, groupName, selectedClasses) => {
    const newMajors = (value.majors || []).map(major => {
      if (major.name === majorName) {
        const newGroups = (major.groups || []).map(group => {
          if (group.name === groupName) {
            const newClasses = selectedClasses.map(className => {
              const existingClass = (group.classes || []).find(c => c.name === className);
              return existingClass || { name: className, sections: [] };
            });
            return { ...group, classes: newClasses };
          }
          return group;
        });
        return { ...major, groups: newGroups };
      }
      return major;
    });
    onChange({ majors: newMajors });
  };

  const handleSectionChange = (majorName, groupName, className, selectedSections) => {
    const newMajors = (value.majors || []).map(major => {
      if (major.name === majorName) {
        const newGroups = (major.groups || []).map(group => {
          if (group.name === groupName) {
            const newClasses = (group.classes || []).map(cls => {
              if (cls.name === className) {
                return { ...cls, sections: selectedSections };
              }
              return cls;
            });
            return { ...group, classes: newClasses };
          }
          return group;
        });
        return { ...major, groups: newGroups };
      }
      return major;
    });
    onChange({ majors: newMajors });
  };

  const availableGroups = (majorName) => [...new Set(allStudents.filter(s => s.major === majorName).map(s => s.group_desc).filter(Boolean))];
  const availableClasses = (majorName, groupName) => [...new Set(allStudents.filter(s => s.major === majorName && s.group_desc === groupName).map(s => s.class_desc).filter(Boolean))];
  const availableSections = (majorName, groupName, className) => [...new Set(allStudents.filter(s => s.major === majorName && s.group_desc === groupName && s.class_desc === className).map(s => s.section_name).filter(Boolean))];

  return (
    <div className="space-y-4 mt-2">
      <div className="space-y-2">
        <Label className="text-gray-300">Majors</Label>
        <MultiSelect
          options={(classStructure.majors || []).map(m => ({ value: m, label: m }))}
          selected={(value.majors || []).map(m => m.name)}
          onChange={handleMajorChange}
          placeholder="Select majors..."
        />
      </div>

      {(value.majors || []).map(major => (
        <div key={major.name} className="pl-4 border-l-2 border-slate-700 space-y-3">
          <div className="space-y-2">
            <Label className="text-gray-300">Groups for {major.name}</Label>
            <MultiSelect
              options={availableGroups(major.name).map(g => ({ value: g, label: g }))}
              selected={(major.groups || []).map(g => g.name)}
              onChange={(selected) => handleGroupChange(major.name, selected)}
              placeholder="Select groups..."
            />
          </div>

          {(major.groups || []).map(group => (
            <div key={group.name} className="pl-4 border-l-2 border-slate-600 space-y-3">
              <div className="space-y-2">
                <Label className="text-gray-300">Classes for {group.name}</Label>
                <MultiSelect
                  options={availableClasses(major.name, group.name).map(c => ({ value: c, label: c }))}
                  selected={(group.classes || []).map(c => c.name)}
                  onChange={(selected) => handleClassChange(major.name, group.name, selected)}
                  placeholder="Select classes..."
                />
              </div>

              {(group.classes || []).map(cls => (
                <div key={cls.name} className="pl-4 border-l-2 border-slate-500 space-y-2">
                  <Label className="text-gray-300">Sections for {cls.name}</Label>
                  <MultiSelect
                    options={availableSections(major.name, group.name, cls.name).map(s => ({ value: s, label: s }))}
                    selected={cls.sections || []}
                    onChange={(selected) => handleSectionChange(major.name, group.name, cls.name, selected)}
                    placeholder="Select sections..."
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ScopeSelector;