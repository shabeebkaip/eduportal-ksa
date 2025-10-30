import React, { useState } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import TeachersPanel from '@/components/SchoolAdmin/management/TeachersPanel';
import StudentsPanel from '@/components/SchoolAdmin/management/StudentsPanel';

export default function UsersManagement() {
  const [activeTab, setActiveTab] = useState('teachers');

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-white/10">
        <CardHeader>
          <CardTitle className="gradient-text text-3xl">Users Management</CardTitle>
          <CardDescription className="text-gray-400">
            Manage all school personnel. Add new staff via the "Add Teacher" button. Roles and specific permissions can be assigned by editing a staff member's profile.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border-white/10 h-12">
          <TabsTrigger value="teachers" className="data-[state=active]:bg-blue-500/20 h-full">
            <Users className="w-5 h-5 mr-2" />Staff
          </TabsTrigger>
          <TabsTrigger value="students" className="data-[state=active]:bg-blue-500/20 h-full">
            <UserPlus className="w-5 h-5 mr-2" />Students
          </TabsTrigger>
        </TabsList>
        <TabsContent value="teachers" className="mt-6">
          <TeachersPanel />
        </TabsContent>
        <TabsContent value="students" className="mt-6">
          <StudentsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}