import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, BarChart2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const reportOptions = [
  {
    title: 'Full Marksheet Report',
    description: 'Generate a detailed, printable marksheet for an entire class for a selected term.',
    icon: <FileText className="w-8 h-8 text-blue-400" />,
    path: '/school-admin/reports/full-marksheet',
    status: 'active'
  },
  {
    title: 'Subject Performance Analysis',
    description: 'Analyze and compare performance across different subjects and classes.',
    icon: <BarChart2 className="w-8 h-8 text-purple-400" />,
    path: '/school-admin/reports/subject-performance',
    status: 'inactive'
  },
];

export default function ReportsManagement() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold text-white tracking-wider">Reports & Analytics Center</h1>
      <p className="text-gray-400">
        Generate comprehensive reports to gain insights into student and school performance.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportOptions.map((report, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="glass-effect border-white/10 h-full flex flex-col">
              <CardHeader className="flex-row items-start gap-4">
                <div className="p-3 bg-slate-800 rounded-lg">{report.icon}</div>
                <div>
                  <CardTitle className="text-white">{report.title}</CardTitle>
                  <CardDescription className="text-gray-400 mt-1">{report.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex items-end">
                {report.status === 'active' ? (
                  <Button onClick={() => handleNavigate(report.path)} className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                    Generate Report <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}