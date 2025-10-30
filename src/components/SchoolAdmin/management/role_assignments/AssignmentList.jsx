import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import _ from 'lodash';

const roleDisplayNames = { 
    'academic-director': 'Academic Director', 
    'head-of-section': 'Head of Section', 
    'subject-coordinator': 'Subject Coordinator',
    'teacher': 'Teacher',
    'school-admin': 'School Admin'
};

const getScopeDescription = (assignments) => {
    const first = assignments[0];
    if (!first || !first.admins) return 'N/A';

    const role = first.admins.role;
    if (role === 'academic-director') {
        const majors = _.uniq(assignments.map(a => a.major)).filter(Boolean).join(', ');
        return `Major(s): ${majors || 'All'}`;
    }
    if (role === 'head-of-section') {
        const scopes = _.uniq(assignments.map(a => [a.major, a.group_desc, a.class_desc, a.section_name].filter(Boolean).join(' / ')));
        return `Scope(s): ${scopes.slice(0, 2).join('; ')}${scopes.length > 2 ? '...' : ''}`;
    }
    if (role === 'subject-coordinator') {
        return `Subject: ${first.subjects?.name || 'N/A'}`;
    }
    return 'General Access';
};

const AssignmentCard = ({ assignmentGroup, onEdit, onDelete, index }) => {
    const firstAssignment = assignmentGroup[0];
    if (!firstAssignment || !firstAssignment.admins) return null;

    return (
        <motion.div
            key={firstAssignment.user_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Card className="glass-effect border-white/10">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">{firstAssignment.admins.name}</p>
                  <p className="text-sm text-gray-400">
                    {roleDisplayNames[firstAssignment.admins.role] || firstAssignment.admins.role}
                    {firstAssignment.admins.secondary_role && ` & ${roleDisplayNames[firstAssignment.admins.secondary_role]}`}
                  </p>
                  <p className="text-xs text-purple-400 mt-1">{getScopeDescription(assignmentGroup)}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(firstAssignment)}>
                        <Edit className="w-4 h-4 text-blue-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(firstAssignment)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                </div>
              </CardContent>
            </Card>
        </motion.div>
    );
};

export default function AssignmentList({ assignments, loading, onEdit, onDelete }) {
    if (loading) return <p className="text-white">Loading assignments...</p>;

    return (
        <div className="space-y-4">
          {assignments.map((group, index) => (
            <AssignmentCard 
                key={group[0].user_id}
                assignmentGroup={group} 
                onEdit={onEdit}
                onDelete={onDelete}
                index={index} 
            />
          ))}
        </div>
    );
}