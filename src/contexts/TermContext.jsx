import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { useToast } from '@/components/ui/use-toast.js';

const TermContext = createContext();

export function useTerm() {
  return useContext(TermContext);
}

export function TermProvider({ children }) {
  const { user } = useAuth();
  const { academicYear } = useAcademicYear();
  const { toast } = useToast();
  const [term, setTerm] = useState(null);
  const [availableTerms, setAvailableTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAvailableTerms = useCallback(async (schoolId, currentAcademicYear) => {
    if (!schoolId || !currentAcademicYear) {
      setAvailableTerms([]);
      setTerm(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('terms')
        .select('*')
        .eq('school_id', schoolId)
        .eq('academic_year', currentAcademicYear)
        .order('start_date', { ascending: true });

      if (error) throw error;
      
      setAvailableTerms(data);

      const storedTermId = localStorage.getItem(`term_${currentAcademicYear}`);
      const storedTerm = data.find(t => t.id.toString() === storedTermId);

      if (storedTerm) {
        setTerm(storedTerm);
      } else if (data.length > 0) {
        const currentTerm = data.find(t => {
            const now = new Date();
            return new Date(t.start_date) <= now && new Date(t.end_date) >= now;
        }) || data[0];
        setTerm(currentTerm);
        localStorage.setItem(`term_${currentAcademicYear}`, currentTerm.id);
      } else {
        setTerm(null);
        localStorage.removeItem(`term_${currentAcademicYear}`);
      }

    } catch (error) {
      console.error('Error fetching terms:', error);
      toast({ variant: "destructive", title: "Error", description: "Could not fetch terms." });
      setAvailableTerms([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const schoolId = user?.user_metadata?.school_id;
    if (schoolId && academicYear) {
      fetchAvailableTerms(schoolId, academicYear);
    } else {
      setAvailableTerms([]);
      setTerm(null);
      setLoading(false);
    }
  }, [user, academicYear, fetchAvailableTerms]);

  const changeTerm = (termId) => {
    const newTerm = availableTerms.find(t => t.id.toString() === termId);
    if (newTerm) {
        setTerm(newTerm);
        localStorage.setItem(`term_${academicYear}`, newTerm.id);
    }
  };

  const value = {
    term,
    availableTerms,
    loading,
    changeTerm,
    refetchAvailableTerms: () => fetchAvailableTerms(user?.user_metadata?.school_id, academicYear),
  };

  return (
    <TermContext.Provider value={value}>
      {children}
    </TermContext.Provider>
  );
}