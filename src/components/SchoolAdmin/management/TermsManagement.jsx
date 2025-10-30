import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const AddEditTermDialog = ({ isOpen, onOpenChange, onSave, term, academicYear }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData(term || { name: '', start_date: '', end_date: '' });
        }
    }, [term, isOpen]);

    const handleSave = () => {
        onSave(formData);
    };

    const isSaveDisabled = !formData.name || !formData.start_date || !formData.end_date;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="glass-effect border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-white">{term ? 'Edit Term' : 'Add New Term'}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Define an academic term for {academicYear}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">Term Name</Label>
                        <Input id="name" placeholder="e.g., Term 1, Fall Semester" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_date" className="text-white">Start Date</Label>
                            <Input id="start_date" type="date" value={formData.start_date || ''} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end_date" className="text-white">End Date</Label>
                            <Input id="end_date" type="date" value={formData.end_date || ''} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={isSaveDisabled} className="bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-50">{term ? 'Save Changes' : 'Create Term'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function TermsManagement() {
    const { user } = useAuth();
    const { academicYear } = useAcademicYear();
    const { toast } = useToast();
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState(null);

    const fetchTerms = async () => {
        if (!user || !academicYear) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('terms')
                .select('*')
                .eq('school_id', user.user_metadata.school_id)
                .eq('academic_year', academicYear)
                .order('start_date', { ascending: true });
            if (error) throw error;
            setTerms(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to fetch terms', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTerms();
    }, [academicYear, user]);

    const handleSaveTerm = async (formData) => {
        const { id, ...data } = formData;
        const dataToSave = { 
            ...data, 
            school_id: user.user_metadata.school_id,
            academic_year: academicYear 
        };

        let error;
        if (id) {
            ({ error } = await supabase.from('terms').update(dataToSave).eq('id', id));
        } else {
            ({ error } = await supabase.from('terms').insert([dataToSave]));
        }

        if (error) {
            toast({ variant: 'destructive', title: 'Save failed', description: error.message });
        } else {
            toast({ title: 'Success', description: 'Term saved successfully.' });
            setIsDialogOpen(false);
            setSelectedTerm(null);
            fetchTerms();
        }
    };

    const handleDeleteTerm = async (id) => {
        const { error } = await supabase.from('terms').delete().eq('id', id);
        if (error) {
            toast({ variant: 'destructive', title: 'Delete failed', description: error.message });
        } else {
            toast({ title: 'Success', description: 'Term deleted.' });
            fetchTerms();
        }
    };

    return (
        <Card className="glass-effect border-white/10">
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle className="text-white">Manage Terms for {academicYear}</CardTitle>
                    <CardDescription className="text-gray-400">Add, edit, or remove academic terms for the selected year.</CardDescription>
                </div>
                <Button onClick={() => { setSelectedTerm(null); setIsDialogOpen(true); }} className="bg-gradient-to-r from-blue-500 to-purple-600">
                    <Plus className="w-4 h-4 mr-2" /> Add Term
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-gray-400">Loading terms...</p>
                ) : terms.length > 0 ? (
                    <div className="space-y-4">
                        {terms.map((term, index) => (
                            <motion.div
                                key={term.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <Calendar className="w-5 h-5 text-cyan-400" />
                                    <div>
                                        <p className="font-semibold text-white">{term.name}</p>
                                        <p className="text-sm text-gray-400">
                                            {new Date(term.start_date).toLocaleDateString()} - {new Date(term.end_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => { setSelectedTerm(term); setIsDialogOpen(true); }}>
                                        <Edit className="w-4 h-4 text-blue-400" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTerm(term.id)}>
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-400">No terms defined for {academicYear}.</p>
                        <p className="text-gray-500 text-sm">Click "Add Term" to get started.</p>
                    </div>
                )}
            </CardContent>
            <AddEditTermDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={handleSaveTerm}
                term={selectedTerm}
                academicYear={academicYear}
            />
        </Card>
    );
}