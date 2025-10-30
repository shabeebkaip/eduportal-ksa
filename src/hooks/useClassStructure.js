import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export function useClassStructure(initialStudents) {
  const { user } = useAuth();
  const { teachers, activeRole } = useData();

  const currentUser = useMemo(() => {
    if (!user || !teachers) return null;
    return teachers.find(t => t.user_id === user.id);
  }, [user, teachers]);

  const students = useMemo(() => {
    if (!initialStudents || !currentUser || !activeRole) {
      return initialStudents;
    }

    if (activeRole === 'academic-director' && currentUser.assignments?.['academic-director']?.majors) {
      const assignedMajors = currentUser.assignments['academic-director'].majors;
      return initialStudents.filter(student => assignedMajors.includes(student.major));
    }
    
    // Add logic for other roles like 'head-of-section' here if needed
    
    return initialStudents;
  }, [initialStudents, currentUser, activeRole]);


  const structure = useMemo(() => {
    const classMap = new Map();
    const majors = new Set();
    const groups = new Map();
    const classDescs = new Map();

    if (!students || students.length === 0) {
      return {
        majors: [],
        getGroups: () => [],
        getClassDescs: () => [],
        getSections: () => [],
        dynamicClasses: [],
      };
    }

    students.forEach(student => {
      const { major, group_desc, class_desc, section_name } = student;
      if (!major || !group_desc || !class_desc || !section_name) return;

      majors.add(major);

      if (!groups.has(major)) groups.set(major, new Set());
      groups.get(major).add(group_desc);

      const groupKey = `${major}-${group_desc}`;
      if (!classDescs.has(groupKey)) classDescs.set(groupKey, new Set());
      classDescs.get(groupKey).add(class_desc);

      const classKey = `${major}-${group_desc}-${class_desc}`;
      if (!classMap.has(classKey)) {
        classMap.set(classKey, {
          id: classKey,
          name: class_desc,
          major: major,
          group: group_desc,
          class: class_desc,
          sections: new Set(),
          studentCount: 0,
        });
      }
      classMap.get(classKey).sections.add(section_name);
      classMap.get(classKey).studentCount++;
    });

    const dynamicClasses = Array.from(classMap.values()).flatMap(cls => 
        Array.from(cls.sections).map(section => ({
            id: `${cls.id}-${section}`,
            name: `${cls.class} - ${section}`,
            major: cls.major,
            group: cls.group,
            class: cls.class,
            section: section,
            studentCount: students.filter(s => s.major === cls.major && s.group_desc === cls.group && s.class_desc === cls.class && s.section_name === section).length,
        }))
    );

    const availableMajors = Array.from(majors).sort();

    return {
      majors: availableMajors.length > 1 ? ['all', ...availableMajors] : availableMajors,
      getGroups: (major) => {
        if (major === 'all' || !major) {
            const allGroups = new Set();
            students.forEach(s => s.group_desc && allGroups.add(s.group_desc));
            return ['all', ...Array.from(allGroups).sort()];
        }
        return ['all', ...Array.from(groups.get(major) || []).sort()];
      },
      getClassDescs: (major, group) => {
        const allClassDescs = new Set();
        students.forEach(s => {
            const majorMatch = major === 'all' || s.major === major;
            const groupMatch = group === 'all' || s.group_desc === group;
            if(majorMatch && groupMatch && s.class_desc) {
                allClassDescs.add(s.class_desc);
            }
        });
        return ['all', ...Array.from(allClassDescs).sort()];
      },
      dynamicClasses: dynamicClasses
    };
  }, [students]);

  return structure;
}