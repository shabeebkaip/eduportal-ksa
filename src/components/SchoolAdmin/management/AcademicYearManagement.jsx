import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAcademicYear } from '@/contexts/AcademicYearContext';

export default function AcademicYearManagement() {
    const { availableYears, addAcademicYear, changeAcademicYear, academicYear } = useAcademicYear();
    const { toast } = useToast();
    const [newYear, setNewYear] = useState('');

    const handleAddYear = async () => {
        if (!/^\d{4}-\d{4}$/.test(newYear)) {
            toast({
                variant: 'destructive',
                title: 'Invalid Format',
                description: 'Please use the format YYYY-YYYY (e.g., 2024-2025).',
            });
            return;
        }
        await addAcademicYear(newYear);
        setNewYear('');
    };

    return (
        <Card className="glass-effect border-white/10">
            <CardHeader>
                <CardTitle className="text-white">Academic Years</CardTitle>
                <CardDescription className="text-gray-400">Manage the academic years for your school.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                    <Input
                        placeholder="e.g., 2024-2025"
                        value={newYear}
                        onChange={(e) => setNewYear(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                    />
                    <Button onClick={handleAddYear} disabled={!newYear}>
                        <Plus className="w-4 h-4 mr-2" /> Add Year
                    </Button>
                </div>
                <div className="space-y-2">
                    {availableYears.map((year, index) => (
                        <motion.div
                            key={year}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                                academicYear === year ? 'bg-blue-500/20' : 'bg-white/5'
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <Calendar className={`w-5 h-5 ${academicYear === year ? 'text-blue-400' : 'text-cyan-400'}`} />
                                <span className="font-medium text-white">{year}</span>
                            </div>
                            {academicYear !== year && (
                                <Button size="sm" variant="ghost" onClick={() => changeAcademicYear(year)}>
                                    <Check className="w-4 h-4 mr-2" /> Set Active
                                </Button>
                            )}
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}