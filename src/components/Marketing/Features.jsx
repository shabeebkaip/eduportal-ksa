import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BrainCircuit, TrendingUp, Target, Users, GitCompareArrows, GraduationCap } from 'lucide-react';

const features = [
  {
    icon: <BrainCircuit className="w-10 h-10 gradient-text" />,
    title: 'AI-Assisted Insights',
    description: 'Go beyond raw data. Our AI identifies at-risk students, curriculum hotspots, and provides actionable recommendations.',
  },
  {
    icon: <TrendingUp className="w-10 h-10 gradient-text" />,
    title: 'Performance Analytics',
    description: 'Visualize student performance with dynamic dashboards. Track trends, compare cohorts, and monitor progress over time.',
  },
  {
    icon: <Target className="w-10 h-10 gradient-text" />,
    title: 'Personalized Learning Paths',
    description: 'Generate tailored roadmaps for both high-achievers and students needing support, ensuring every student reaches their potential.',
  },
  {
    icon: <Users className="w-10 h-10 gradient-text" />,
    title: 'Role-Based Dashboards',
    description: 'Customized views for Admins, Teachers, Students, and Parents, ensuring everyone has the right information at their fingertips.',
  },
  {
    icon: <GitCompareArrows className="w-10 h-10 gradient-text" />,
    title: 'Comparative Analysis',
    description: 'Benchmark performance across different schools, grades, and sections to identify best practices and areas for improvement.',
  },
  {
    icon: <GraduationCap className="w-10 h-10 gradient-text" />,
    title: 'Comprehensive Reporting',
    description: 'Effortlessly generate detailed marksheets and summary reports for any class, term, or academic year.',
  },
];

const cardVariants = {
  offscreen: { y: 50, opacity: 0 },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20
    }
  }
};

export default function Features() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white tracking-tight">The Future of Education is Here</h2>
          <p className="mt-4 text-lg text-gray-400">
            EduPortal provides an all-in-one solution to monitor, analyze, and enhance the academic journey of every student.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-effect h-full flex flex-col text-center items-center p-6 transform hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-slate-800 border border-slate-700 mb-6">
                  {feature.icon}
                </div>
                <CardHeader className="p-0">
                  <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-2 flex-grow">
                  <CardDescription className="text-gray-400">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}