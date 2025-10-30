import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { useTerm } from '@/contexts/TermContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Printer, Search, ArrowLeft, FileDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useData } from '@/contexts/DataContext';

export default function FullMarksheetReport() {
  const { user } = useAuth();
  const { academicYear } = useAcademicYear();
  const { term } = useTerm();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { activeRole } = useData();

  const [loading, setLoading] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [accessibleClasses, setAccessibleClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [reportData, setReportData] = useState(null);

  const fetchAccessibleClasses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_report_access_v2', { p_user_id: user.id });

      if (error) throw error;
      
      const uniqueClasses = Array.from(new Map((data || []).map(item => [
        `${item.major}-${item.group_desc}-${item.class_desc}-${item.section_name}`,
        item
      ])).values());

      setAccessibleClasses(uniqueClasses);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to fetch accessible classes', description: error.message });
      setAccessibleClasses([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchAccessibleClasses();
  }, [fetchAccessibleClasses, activeRole]);

  const handleGenerateReport = async () => {
    if (!selectedClass || !term) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a class and ensure a term is active.' });
      return;
    }
    setLoadingReport(true);
    setReportData(null);
    try {
      const classParams = JSON.parse(selectedClass);
      const { data, error } = await supabase.rpc('get_full_marksheet_report', {
        p_school_id: user.user_metadata.school_id,
        p_academic_year: academicYear,
        p_term_id: term.id,
        p_major: classParams.major,
        p_group_desc: classParams.group_desc,
        p_class_desc: classParams.class_desc,
        p_section_name: classParams.section_name
      });
      if (error) throw error;
      setReportData(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to generate report', description: error.message });
    } finally {
      setLoadingReport(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportToExcel = () => {
    if (!reportData) return;

    const { header_info, assessment_structure, student_data } = reportData;
    const mainAssessments = (assessment_structure || []).map(ma => ({ ...ma, sub_assessments: ma.sub_assessments || [] }));
    const allSubAssessments = mainAssessments.flatMap(ma => ma.sub_assessments);

    const ws_data = [];
    
    ws_data.push([header_info.school_name, null, null, null, 'Marksheet']);
    ws_data.push([]);
    ws_data.push(['Class:', header_info.class_name, null, 'Term:', header_info.term_name]);
    ws_data.push(['Academic Year:', header_info.academic_year]);
    ws_data.push([]);

    const headerRow1 = ['S.No', 'Student'];
    const headerRow2 = ['', ''];
    const merges = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
      { s: { r: 0, c: 4 }, e: { r: 0, c: 6 } },
      { s: { r: 2, c: 1 }, e: { r: 2, c: 2 } },
      { s: { r: 2, c: 4 }, e: { r: 2, c: 5 } },
      { s: { r: 3, c: 1 }, e: { r: 3, c: 2 } },
    ];

    let col = 2;
    mainAssessments.forEach(ma => {
      headerRow1.push(`${ma.main_assessment_name} (${ma.main_assessment_weightage}%)`);
      for (let i = 1; i < ma.sub_assessments.length; i++) {
        headerRow1.push('');
      }
      if (ma.sub_assessments.length > 1) {
        merges.push({ s: { r: 5, c: col }, e: { r: 5, c: col + ma.sub_assessments.length - 1 } });
      }
      col += ma.sub_assessments.length;
    });
    headerRow1.push('Final Grade');

    allSubAssessments.forEach(sa => {
      headerRow2.push(`${sa.sub_assessment_name} (${sa.sub_assessment_max_marks})`);
    });
    headerRow2.push('');

    ws_data.push(headerRow1);
    ws_data.push(headerRow2);

    student_data.forEach((student, index) => {
      const row = [
        index + 1,
        `${student.first_name} ${student.father_name} ${student.last_name}`
      ];
      allSubAssessments.forEach(sa => {
        row.push(student.marks?.[sa.sub_assessment_id] ?? '-');
      });
      row.push(student.final_grade?.toFixed(2) + '%');
      ws_data.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!merges'] = merges;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Marksheet');

    const fileName = `Marksheet_${header_info.class_name.replace(/[\/ ]/g, '_')}_${header_info.term_name}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };
  
  const handleBackNavigation = () => {
    if(activeRole === 'school-admin' || activeRole === 'academic-director' || activeRole === 'head_of_section') {
      navigate('/school-admin/reports');
    } else if (activeRole === 'teacher') {
      navigate('/teacher/reports');
    } else {
      navigate(-1);
    }
  };

  const mainAssessments = useMemo(() => {
    const structure = reportData?.assessment_structure || [];
    return structure.map(ma => ({
        ...ma,
        sub_assessments: ma.sub_assessments || []
    }));
  }, [reportData]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="print-hidden">
        <Button variant="ghost" size="sm" className="mb-4" onClick={handleBackNavigation}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-white tracking-wider">Full Marksheet Report</h1>
      </div>

      <Card className="glass-effect border-white/10 print-hidden">
        <CardHeader>
          <CardTitle className="text-white">Report Filters</CardTitle>
          <CardDescription className="text-gray-400">Select a class to generate the marksheet.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Select
            onValueChange={setSelectedClass}
            disabled={loading || accessibleClasses.length === 0}
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder={loading ? "Loading classes..." : "Select a class..."} />
            </SelectTrigger>
            <SelectContent className="glass-effect border-white/10">
              {accessibleClasses.map((c, i) => (
                <SelectItem key={i} value={JSON.stringify({ major: c.major, group_desc: c.group_desc, class_desc: c.class_desc, section_name: c.section_name })}>
                  {c.major} / {c.group_desc} / {c.class_desc} ({c.section_name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateReport} disabled={!selectedClass || loadingReport} className="bg-gradient-to-r from-blue-500 to-purple-600">
            <Search className="w-4 h-4 mr-2" />
            {loadingReport ? 'Generating...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>

      {reportData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="print-hidden flex justify-end gap-2 mb-4">
            <Button onClick={handlePrint} className="bg-gradient-to-r from-green-500 to-teal-600">
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
            <Button onClick={handleExportToExcel} className="bg-gradient-to-r from-sky-500 to-indigo-600">
              <FileDown className="w-4 h-4 mr-2" /> Export to Excel
            </Button>
          </div>
          <Card className="report-card glass-effect border-white/10 print:shadow-none print:border-none print:bg-white print:text-black">
            <CardHeader className="print-header">
              <div className="flex justify-between items-center mb-4">
                <img  alt="School Logo" class="h-16 print-visible" src="https://images.unsplash.com/photo-1684128168360-7bf8aca7627a" />
                <div className="text-right">
                  <h2 className="text-3xl font-bold">{reportData.header_info.school_name}</h2>
                  <p className="text-lg">Marksheet</p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <p><strong>Class:</strong> {reportData.header_info.class_name}</p>
                <p><strong>Term:</strong> {reportData.header_info.term_name}</p>
                <p><strong>Academic Year:</strong> {reportData.header_info.academic_year}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-max text-left text-sm">
                  <thead className="bg-white/10 print:bg-gray-200">
                    <tr>
                      <th rowSpan="2" className="p-2 border border-white/20 print:border-gray-400 align-bottom">S.No</th>
                      <th rowSpan="2" className="p-2 border border-white/20 print:border-gray-400 align-bottom">Student</th>
                      {mainAssessments.map(ma => (
                        <th key={ma.main_assessment_id} colSpan={ma.sub_assessments.length || 1} className="p-2 border border-white/20 print:border-gray-400 text-center">
                          {ma.main_assessment_name} ({ma.main_assessment_weightage}%)
                        </th>
                      ))}
                      <th rowSpan="2" className="p-2 border border-white/20 print:border-gray-400 align-bottom text-center">Final Grade</th>
                    </tr>
                    <tr>
                      {mainAssessments.flatMap(ma => ma.sub_assessments).map(sa => (
                        <th key={sa.sub_assessment_id} className="p-2 border border-white/20 print:border-gray-400 text-center font-normal">
                          {sa.sub_assessment_name} <br/> ({sa.sub_assessment_max_marks})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-white print:text-black">
                    {reportData.student_data.map((student, index) => (
                      <tr key={student.student_id} className="hover:bg-white/5 print:hover:bg-gray-50">
                        <td className="p-2 border border-white/20 print:border-gray-400 text-center font-bold">{index + 1}</td>
                        <td className="p-2 border border-white/20 print:border-gray-400">
                          <div className="font-semibold">{student.first_name} {student.father_name} {student.last_name}</div>
                        </td>
                        {mainAssessments.flatMap(ma => ma.sub_assessments).map(sa => (
                          <td key={`${student.student_id}-${sa.sub_assessment_id}`} className="p-2 border border-white/20 print:border-gray-400 text-center">
                            {student.marks?.[sa.sub_assessment_id] ?? '-'}
                          </td>
                        ))}
                        <td className="p-2 border border-white/20 print:border-gray-400 text-center font-bold text-lg text-cyan-400 print:text-blue-600">
                          {student.final_grade?.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}