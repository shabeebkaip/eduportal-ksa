import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast.js';

const AcademicYearContext = createContext();

export function useAcademicYear() {
  return useContext(AcademicYearContext);
}

export function AcademicYearProvider({ children }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [academicYear, setAcademicYear] = useState(localStorage.getItem('academicYear') || '');
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAvailableYears = useCallback(async (schoolId) => {
    if (!schoolId) {
      setAvailableYears([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: studentYearsData, error: studentYearsError } = await supabase
        .from('students')
        .select('academic_year')
        .eq('school_id', schoolId)
        .not('academic_year', 'is', null);

      if (studentYearsError) throw studentYearsError;
        
      const { data: academicYearsData, error: academicYearsError } = await supabase
        .from('academic_years')
        .select('year')
        .eq('school_id', schoolId);
        
      if (academicYearsError) throw academicYearsError;

      const studentYears = studentYearsData.map(item => item.academic_year);
      const savedYears = academicYearsData.map(item => item.year);
      
      const distinctYears = [...new Set([...studentYears, ...savedYears])].sort((a, b) => b.localeCompare(a));
      
      setAvailableYears(distinctYears);

      if (distinctYears.length > 0) {
        if (!academicYear || !distinctYears.includes(academicYear)) {
          const latestYear = distinctYears[0];
          setAcademicYear(latestYear);
          localStorage.setItem('academicYear', latestYear);
        }
      } else {
        setAcademicYear('');
        localStorage.removeItem('academicYear');
      }
    } catch (error) {
      console.error('Error fetching academic years:', error.message);
      toast({ variant: "destructive", title: "Error fetching academic years", description: error.message });
      setAvailableYears([]);
    } finally {
      setLoading(false);
    }
  }, [academicYear, toast]);

  useEffect(() => {
    const schoolId = user?.user_metadata?.school_id;
    if (schoolId) {
      fetchAvailableYears(schoolId);
    } else {
      setAvailableYears([]);
      setAcademicYear('');
      localStorage.removeItem('academicYear');
      setLoading(false);
    }
  }, [user, fetchAvailableYears]);

  const changeAcademicYear = (year) => {
    setAcademicYear(year);
    localStorage.setItem('academicYear', year);
  };

  const addAcademicYear = async (year) => {
    const schoolId = user?.user_metadata?.school_id;
    if (!year || !schoolId) return;

    if (availableYears.includes(year)) {
      toast({ title: 'Year already exists.' });
      return;
    }
    
    const { error } = await supabase
      .from('academic_years')
      .insert({ school_id: schoolId, year: year });

    if (error) {
      console.error('Error adding academic year:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save new academic year.' });
    } else {
      const updatedYears = [...availableYears, year].sort((a, b) => b.localeCompare(a));
      setAvailableYears(updatedYears);
      changeAcademicYear(year);
      toast({ title: 'Academic year added successfully!' });
    }
  };

  const value = {
    academicYear,
    availableYears,
    loading,
    changeAcademicYear,
    addAcademicYear,
    refetchAvailableYears: () => fetchAvailableYears(user?.user_metadata?.school_id),
  };

  return (
    <AcademicYearContext.Provider value={value}>
      {children}
    </AcademicYearContext.Provider>
  );
}