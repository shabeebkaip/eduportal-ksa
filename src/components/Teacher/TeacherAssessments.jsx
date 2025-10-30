import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { useTerm } from '@/contexts/TermContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, FilePlus, ListPlus, ClipboardEdit } from 'lucide-react';

const AddEditMainAssessmentDialog = ({ isOpen, onOpenChange, onSave, mainAssessment, teacherAssignments, terms }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData(mainAssessment || { name: '', weightage: '', assignment_id: '', term_id: '' });
        }
    }, [mainAssessment, isOpen]);

    const handleSave = () => {
        onSave(formData);
    };

    const isSaveDisabled = !formData.name || !formData.weightage || !formData.assignment_id || !formData.term_id || formData.weightage < 0 || formData.weightage > 100;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="glass-effect border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-white">{mainAssessment ? 'Edit Main Assessment' : 'Add Main Assessment'}</DialogTitle>
                    <DialogDescription className="text-gray-400">Define a category for assessments, like "Quizzes" or "Homework".</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">Assessment Name</Label>
                        <Input id="name" placeholder="e.g., Quizzes" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="weightage" className="text-white">Weightage (%)</Label>
                        <Input id="weightage" type="number" placeholder="e.g., 25" value={formData.weightage || ''} onChange={e => setFormData({ ...formData, weightage: parseFloat(e.target.value) || '' })} className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="assignment" className="text-white">Class & Subject</Label>
                            <Select value={formData.assignment_id?.toString()} onValueChange={value => setFormData({ ...formData, assignment_id: value })}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select a class" /></SelectTrigger>
                                <SelectContent className="glass-effect border-white/10">
                                    {teacherAssignments.map(a => (
                                        <SelectItem key={a.id} value={a.id.toString()}>
                                            {a.major} / {a.group_desc} / {a.class_desc} ({a.section_name}) - {a.subject_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="term" className="text-white">Term</Label>
                            <Select value={formData.term_id?.toString()} onValueChange={value => setFormData({ ...formData, term_id: value })}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select a term" /></SelectTrigger>
                                <SelectContent className="glass-effect border-white/10">
                                    {terms.map(t => (
                                        <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={isSaveDisabled} className="bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-50">{mainAssessment ? 'Save Changes' : 'Create Assessment'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const AddEditSubAssessmentDialog = ({ isOpen, onOpenChange, onSave, subAssessment }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData(subAssessment || { name: '', max_marks: '' });
        }
    }, [subAssessment, isOpen]);

    const handleSave = () => {
        onSave(formData);
    };

    const isSaveDisabled = !formData.name || !formData.max_marks || formData.max_marks <= 0;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="glass-effect border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-white">{subAssessment ? 'Edit Sub-Assessment' : 'Add Sub-Assessment'}</DialogTitle>
                    <DialogDescription className="text-gray-400">Add an individual assessment item.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">Sub-Assessment Name</Label>
                        <Input id="name" placeholder="e.g., Quiz 1" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="max_marks" className="text-white">Max Marks (Out of)</Label>
                        <Input id="max_marks" type="number" placeholder="e.g., 10" value={formData.max_marks || ''} onChange={e => setFormData({ ...formData, max_marks: parseFloat(e.target.value) || '' })} className="bg-white/5 border-white/10 text-white" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={isSaveDisabled} className="bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-50">{subAssessment ? 'Save Changes' : 'Create Item'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function TeacherAssessments() {
    const { user } = useAuth();
    const { academicYear } = useAcademicYear();
    const { term, availableTerms } = useTerm();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [mainAssessments, setMainAssessments] = useState([]);
    const [teacherAssignments, setTeacherAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isMainDialogOpen, setIsMainDialogOpen] = useState(false);
    const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
    const [selectedMain, setSelectedMain] = useState(null);
    const [selectedSub, setSelectedSub] = useState(null);
    const [mainToAddTo, setMainToAddTo] = useState(null);
    const [expanded, setExpanded] = useState({});
    
    const fetchData = useCallback(async () => {
        if (!user || !academicYear || !term) {
            setLoading(false);
            return;
        }
        setLoading(true);

        try {
            const { data: teacherData, error: teacherError } = await supabase
                .from('teachers')
                .select('id, school_id')
                .eq('user_id', user.id)
                .single();
            if (teacherError) throw teacherError;
            if (!teacherData) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not find teacher profile.' });
                return;
            }

            const { data: assignmentsData, error: assignmentsError } = await supabase
                .from('teacher_assignments')
                .select('*, subjects(name)')
                .eq('teacher_id', teacherData.id)
                .eq('academic_year', academicYear);
            if (assignmentsError) throw assignmentsError;
            
            const formattedAssignments = assignmentsData.map(a => ({...a, subject_name: a.subjects.name}));
            setTeacherAssignments(formattedAssignments);

            const { data: assessmentsData, error: assessmentsError } = await supabase
                .from('main_assessments')
                .select('*, sub_assessments(*)')
                .eq('teacher_id', teacherData.id)
                .eq('academic_year', academicYear)
                .eq('term_id', term.id);
            if (assessmentsError) throw assessmentsError;
            
            // Ensure sub_assessments is always an array
            const processedAssessments = assessmentsData.map(ma => ({
                ...ma,
                sub_assessments: ma.sub_assessments || []
            }));

            setMainAssessments(processedAssessments);

        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to fetch assessment data', description: error.message });
        } finally {
            setLoading(false);
        }
    }, [user, academicYear, term, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveMain = async (formData) => {
        const { id, ...data } = formData;
        const { data: teacherData } = await supabase.from('teachers').select('id, school_id').eq('user_id', user.id).single();
        const dataToSave = { ...data, academic_year: academicYear, teacher_id: teacherData.id, school_id: teacherData.school_id };

        let error;
        if (id) {
            ({ error } = await supabase.from('main_assessments').update(dataToSave).eq('id', id));
        } else {
            ({ error } = await supabase.from('main_assessments').insert([dataToSave]));
        }

        if (error) {
            toast({ variant: 'destructive', title: 'Save failed', description: error.message });
        } else {
            toast({ title: 'Success', description: 'Main assessment saved successfully.' });
            setIsMainDialogOpen(false);
            setSelectedMain(null);
            fetchData();
        }
    };

    const handleSaveSub = async (formData) => {
        const { id, ...data } = formData;
        const dataToSave = { ...data, main_assessment_id: mainToAddTo.id };

        let error;
        if (id) {
            ({ error } = await supabase.from('sub_assessments').update(dataToSave).eq('id', id));
        } else {
            ({ error } = await supabase.from('sub_assessments').insert([dataToSave]));
        }

        if (error) {
            toast({ variant: 'destructive', title: 'Save failed', description: error.message });
        } else {
            toast({ title: 'Success', description: 'Sub-assessment saved successfully.' });
            setIsSubDialogOpen(false);
            setSelectedSub(null);
            setMainToAddTo(null);
            fetchData();
        }
    };
    
    const handleDeleteMain = async (id) => {
        const { error } = await supabase.from('main_assessments').delete().eq('id', id);
        if (error) {
            toast({ variant: 'destructive', title: 'Delete failed', description: error.message });
        } else {
            toast({ title: 'Success', description: 'Main assessment deleted.' });
            fetchData();
        }
    };

    const handleDeleteSub = async (id) => {
        const { error } = await supabase.from('sub_assessments').delete().eq('id', id);
        if (error) {
            toast({ variant: 'destructive', title: 'Delete failed', description: error.message });
        } else {
            toast({ title: 'Success', description: 'Sub-assessment deleted.' });
            fetchData();
        }
    };
    
    const assessmentsByAssignment = useMemo(() => {
        const grouped = {};
        mainAssessments.forEach(assessment => {
            const assignmentId = assessment.assignment_id;
            if (!grouped[assignmentId]) {
                const assignment = teacherAssignments.find(a => a.id === assignmentId);
                grouped[assignmentId] = {
                    assignmentInfo: assignment,
                    assessments: [],
                    totalWeightage: 0,
                };
            }
            grouped[assignmentId].assessments.push(assessment);
            grouped[assignmentId].totalWeightage += parseFloat(assessment.weightage);
        });
        return grouped;
    }, [mainAssessments, teacherAssignments]);

    if (loading) return <div className="text-white">Loading assessments...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Assessments for {term?.name || '...'}</h1>
                <Button onClick={() => { setSelectedMain(null); setIsMainDialogOpen(true); }} className="bg-gradient-to-r from-blue-500 to-purple-600">
                    <FilePlus className="w-4 h-4 mr-2" /> Add Main Assessment
                </Button>
            </div>
            
            {Object.keys(assessmentsByAssignment).length === 0 && (
                <div className="text-center py-16 glass-effect rounded-lg">
                    <p className="text-gray-400">No assessments created for this term.</p>
                    <p className="text-gray-500 text-sm">Click "Add Main Assessment" to get started.</p>
                </div>
            )}

            {Object.entries(assessmentsByAssignment).map(([assignmentId, group]) => {
                const { assignmentInfo, assessments, totalWeightage } = group;
                if (!assignmentInfo) return null;
                const isOverweight = totalWeightage > 100;
                
                return (
                    <Card key={assignmentId} className="glass-effect border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">{assignmentInfo.major} / {assignmentInfo.group_desc} / {assignmentInfo.class_desc} ({assignmentInfo.section_name})</CardTitle>
                            <CardDescription className="text-gray-400">{assignmentInfo.subject_name}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {assessments.map(main => (
                                <div key={main.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpanded(prev => ({...prev, [main.id]: !prev[main.id]}))}>
                                        <div className="flex items-center space-x-3">
                                            {expanded[main.id] ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
                                            <p className="font-semibold text-white">{main.name} <span className="text-gray-400">({main.weightage}%)</span></p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                             <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setMainToAddTo(main); setSelectedSub(null); setIsSubDialogOpen(true); }}>
                                                <ListPlus className="w-4 h-4 text-green-400" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedMain(main); setIsMainDialogOpen(true); }}>
                                                <Edit className="w-4 h-4 text-blue-400" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteMain(main.id); }}>
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </Button>
                                        </div>
                                    </div>
                                    {expanded[main.id] && (
                                        <div className="pl-8 pt-4 space-y-2">
                                            {main.sub_assessments.length > 0 ? main.sub_assessments.map(sub => (
                                                <div key={sub.id} className="flex justify-between items-center p-2 rounded bg-slate-800/50">
                                                    <p className="text-gray-300">{sub.name} <span className="text-gray-500">(Out of {sub.max_marks})</span></p>
                                                    <div className="flex items-center space-x-1">
                                                        <Button variant="outline" size="sm" className="h-8 border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300" onClick={() => navigate(`/teacher/assessments/marks-entry/${sub.id}`)}>
                                                            <ClipboardEdit className="w-4 h-4 mr-2" />
                                                            Enter Marks
                                                        </Button>
                                                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setMainToAddTo(main); setSelectedSub(sub); setIsSubDialogOpen(true); }}>
                                                            <Edit className="w-4 h-4 text-blue-400" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteSub(sub.id)}>
                                                            <Trash2 className="w-4 h-4 text-red-400" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )) : <p className="text-gray-500 text-sm">No sub-assessments yet.</p>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className={`text-sm ${isOverweight ? 'text-red-400 font-bold' : 'text-green-400'}`}>
                            Total Weightage: {totalWeightage.toFixed(2)}% {isOverweight && "(Warning: Exceeds 100%)"}
                        </CardFooter>
                    </Card>
                )
            })}
            
            {isMainDialogOpen && <AddEditMainAssessmentDialog isOpen={isMainDialogOpen} onOpenChange={setIsMainDialogOpen} onSave={handleSaveMain} mainAssessment={selectedMain} teacherAssignments={teacherAssignments} terms={availableTerms} />}
            {isSubDialogOpen && <AddEditSubAssessmentDialog isOpen={isSubDialogOpen} onOpenChange={setIsSubDialogOpen} onSave={handleSaveSub} subAssessment={selectedSub} />}
        </div>
    );
}