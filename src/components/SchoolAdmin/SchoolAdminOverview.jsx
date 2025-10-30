import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Users, BookOpen, BarChart, Percent } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const StatCard = ({ icon, title, value, description, color }) => {
  return (
    <Card className={`glass-effect border-${color}-500/20`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-white">{value}</div>
        <p className="text-xs text-gray-400">{description}</p>
      </CardContent>
    </Card>
  );
};


const SchoolAdminOverview = () => {
  const { dashboardStats, loading } = useData();

  if (loading) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="glass-effect animate-pulse">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <div className="h-4 bg-slate-700 rounded w-2/4"></div>
                       <div className="h-6 w-6 bg-slate-700 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-10 bg-slate-700 rounded w-1/4 mt-2"></div>
                        <div className="h-3 bg-slate-700 rounded w-3/4 mt-2"></div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={dashboardStats?.total_students || 0}
          description="Number of active students"
          icon={<Users className="h-5 w-5 text-cyan-400" />}
          color="cyan"
        />
        <StatCard
          title="Total Teachers"
          value={dashboardStats?.total_teachers || 0}
          description="Number of active teachers"
          icon={<Users className="h-5 w-5 text-green-400" />}
          color="green"
        />
        <StatCard
          title="Active Assessments"
          value={dashboardStats?.active_assessments || 0}
          description="Assessments this academic year"
          icon={<BookOpen className="h-5 w-5 text-yellow-400" />}
          color="yellow"
        />
        <StatCard
          title="Average Performance"
          value={`${dashboardStats?.average_performance || 0}%`}
          description="Across all assessments"
          icon={<Percent className="h-5 w-5 text-purple-400" />}
          color="purple"
        />
      </div>
    </div>
  );
};

export default SchoolAdminOverview;