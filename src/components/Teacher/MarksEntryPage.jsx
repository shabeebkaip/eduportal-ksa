import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { useTerm } from '@/contexts/TermContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Save, User, Search, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MarksEntryPage() {
    const { subAssessmentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { academicYear } = useAcademicYear();
    const { term } = useTerm();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [subAssessment, setSubAssessment] = useState(null);
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const inputRefs = useRef({});

    const filteredStudents = students.filter(student =>
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchData = useCallback(async () => {
        if (!user || !academicYear || !subAssessmentId || !term) return;
        setLoading(true);

        try {
            const { data: subAssessmentData, error: subAssessmentError } = await supabase
                .from('sub_assessments')
                .select('*, main_assessments(*, teacher_assignments(*))')
                .eq('id', subAssessmentId)
                .single();

            if (subAssessmentError) throw subAssessmentError;
            
            // Validate that the assessment belongs to the current term
            if(subAssessmentData.main_assessments.term_id !== term.id) {
                toast({ variant: 'destructive', title: 'Term Mismatch', description: 'This assessment does not belong to the currently selected term. Please switch terms to enter marks.' });
                navigate('/teacher/assessments');
                return;
            }
            
            setSubAssessment(subAssessmentData);

            const assignment = subAssessmentData.main_assessments.teacher_assignments;
            const { data: studentsData, error: studentsError } = await supabase
                .from('students')
                .select('id, first_name, last_name, student_code')
                .eq('school_id', user.user_metadata.school_id)
                .eq('academic_year', academicYear)
                .eq('major', assignment.major)
                .eq('group_desc', assignment.group_desc)
                .eq('class_desc', assignment.class_desc)
                .eq('section_name', assignment.section_name)
                .order('first_name', { ascending: true });

            if (studentsError) throw studentsError;
            setStudents(studentsData);

            const { data: marksData, error: marksError } = await supabase
                .from('student_marks')
                .select('student_id, marks_obtained')
                .eq('sub_assessment_id', subAssessmentId);

            if (marksError) throw marksError;

            const marksMap = marksData.reduce((acc, mark) => {
                acc[mark.student_id] = mark.marks_obtained;
                return acc;
            }, {});
            setMarks(marksMap);

        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to load data', description: error.message });
        } finally {
            setLoading(false);
        }
    }, [user, academicYear, subAssessmentId, term, toast, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleMarkChange = (studentId, value) => {
        const maxMarks = subAssessment?.max_marks;
        const numericValue = value === '' ? '' : parseFloat(value);

        if (value === '' || (numericValue >= 0 && numericValue <= maxMarks)) {
            setMarks(prev => ({ ...prev, [studentId]: numericValue }));
        } else if (numericValue > maxMarks) {
            toast({
                variant: 'destructive',
                title: 'Invalid Mark',
                description: `Mark cannot exceed the maximum of ${maxMarks}.`,
            });
        }
    };
    
    const handleKeyDown = (e, currentIndex) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextStudent = filteredStudents[currentIndex + 1];
            if (nextStudent) {
                inputRefs.current[nextStudent.id]?.focus();
            } else {
                document.getElementById('save-marks-button')?.focus();
            }
        }
    };

    const handleSaveMarks = async () => {
        setSaving(true);
        const { data: teacherData } = await supabase.from('teachers').select('id, school_id').eq('user_id', user.id).single();

        const marksToUpsert = Object.entries(marks)
            .filter(([, value]) => value !== '' && value !== null && !isNaN(value))
            .map(([student_id, marks_obtained]) => ({
                student_id: parseInt(student_id),
                sub_assessment_id: parseInt(subAssessmentId),
                marks_obtained,
                school_id: teacherData.school_id,
                teacher_id: teacherData.id,
                academic_year: academicYear,
            }));

        if (marksToUpsert.length === 0) {
            toast({ title: 'No marks to save', description: 'No new or updated marks were entered.' });
            setSaving(false);
            return;
        }

        const { error } = await supabase.from('student_marks').upsert(marksToUpsert, {
            onConflict: 'student_id,sub_assessment_id',
        });

        if (error) {
            toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
        } else {
            toast({ title: 'Success!', description: 'All marks have been saved successfully.' });
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div></div>;
    }

    if (!subAssessment) {
        return <div className="text-white text-center">Assessment not found or not part of the selected term.</div>;
    }
    
    const assignment = subAssessment.main_assessments.teacher_assignments;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="glass-effect border-white/10">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate('/teacher/assessments')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Assessments
                            </Button>
                            <CardTitle className="text-white text-2xl">{subAssessment.name}</CardTitle>
                            <CardDescription className="text-gray-400 mt-2">
                                For: {assignment.major} / {assignment.group_desc} / {assignment.class_desc} ({assignment.section_name})
                            </CardDescription>
                            <div className="flex items-center text-purple-400 text-sm mt-1">
                                <BookOpen className="w-4 h-4 mr-2" />
                                <span>{term?.name}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-400">Max Marks</p>
                            <p className="text-3xl font-bold text-blue-400">{subAssessment.max_marks}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border-white/10 text-white pl-10"
                        />
                    </div>
                    <div className="max-h-[55vh] overflow-y-auto pr-2 space-y-2">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student, index) => (
                                <div key={student.id} className="flex items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                    <div className="p-2 bg-blue-500/20 rounded-full mr-4">
                                        <User className="w-5 h-5 text-blue-300" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-white">{student.first_name} {student.last_name}</p>
                                        <p className="text-sm text-gray-400 font-mono">{student.student_code}</p>
                                    </div>
                                    <Input
                                        ref={el => inputRefs.current[student.id] = el}
                                        type="number"
                                        value={marks[student.id] ?? ''}
                                        onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        placeholder="-"
                                        className="w-24 bg-white/10 border-white/20 text-white text-center font-bold"
                                        max={subAssessment.max_marks}
                                        min="0"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-gray-400">No students found for this class.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button id="save-marks-button" onClick={handleSaveMarks} disabled={saving} className="w-full bg-gradient-to-r from-green-500 to-teal-600">
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}