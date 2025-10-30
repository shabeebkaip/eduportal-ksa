import React, { useState, useEffect, useCallback } from 'react';
    import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { useToast } from '@/components/ui/use-toast.js';
    import { useDropzone } from 'react-dropzone';
    import Papa from 'papaparse';
    import { UploadCloud, CheckCircle, XCircle } from 'lucide-react';

    const STUDENT_CSV_HEADERS = ["student_code", "Academic_Year","E_Major_Desc","E_Group_Desc","E_Class_Desc","E_Section_Name","E_Child_Name","E_Father_Name","E_Family_Name","UserName","Password","Father_Email","Family_UserName","Family_Password","FatherPhone1","FatherPhone2","MotherPhone1","Open Balance","Total Tution Fees","Total Tution Fees (+VAT)","Tution Fees Balance","Transportion","Other","TOTAL_Balance"];
    const TEACHER_CSV_HEADERS = ["name","email","subject"];

    const BulkUploadDialog = ({ isOpen, onOpenChange, userType, onUpload }) => {
      const [file, setFile] = useState(null);
      const [parsedData, setParsedData] = useState([]);
      const [errors, setErrors] = useState([]);
      const [parsing, setParsing] = useState(false);
      const [uploading, setUploading] = useState(false);
      const { toast } = useToast();

      useEffect(() => {
        if (!isOpen) {
          setFile(null);
          setParsedData([]);
          setErrors([]);
          setParsing(false);
          setUploading(false);
        }
      }, [isOpen]);

      const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
          setFile(acceptedFiles[0]);
          setParsedData([]);
          setErrors([]);
          parseFile(acceptedFiles[0]);
        }
      }, [userType]);

      const parseFile = (fileToParse) => {
        setParsing(true);
        Papa.parse(fileToParse, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            validateData(results.data);
            setParsing(false);
          },
          error: (error) => {
            toast({variant: 'destructive', title: 'Parsing Error', description: error.message});
            setParsing(false);
          }
        });
      };

      const validateData = (data) => {
        const validRows = [];
        const errorRows = [];
        const studentCodesInFile = new Set();

        data.forEach((row, index) => {
          let error = null;
          
          const isEmptyRow = Object.values(row).every(val => !val || val.trim() === '');
          if (isEmptyRow) return;

          if (userType === 'students') {
            const studentCode = row.student_code || row.UserName;
            if (studentCode && studentCodesInFile.has(studentCode)) {
                error = `Duplicate student_code or UserName in CSV file: ${studentCode}.`;
            } else if (!row.E_Child_Name) {
                error = 'Missing required field: E_Child_Name.';
            }
          } else { 
            if (!row.name || !row.email) {
              error = 'Missing required fields (name, email)';
            }
          }

          if (error) {
            errorRows.push({ ...row, error, index: index + 2 });
          } else {
            const studentCode = row.student_code || row.UserName;
            if (userType === 'students' && studentCode) {
              studentCodesInFile.add(studentCode);
            }
            validRows.push(row);
          }
        });
        setParsedData(validRows);
        setErrors(errorRows);
      };
      
      const handleDownloadSample = () => {
        const headers = userType === 'students' ? STUDENT_CSV_HEADERS : TEACHER_CSV_HEADERS;
        const csv = Papa.unparse([headers]);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `sample_${userType}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      
      const handleUpload = async () => {
        setUploading(true);
        await onUpload(parsedData);
        setUploading(false);
        onOpenChange(false);
      };

      const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] }, maxFiles: 1 });

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="glass-effect border-white/10 sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-white">Bulk Sync {userType}</DialogTitle>
              <DialogDescription className="text-gray-400">
                Upload a CSV to add new students, update existing ones, and deactivate students not in the file.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!file && (
                <div {...getRootProps()} className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/20 hover:border-blue-500/50'}`}>
                  <input {...getInputProps()} />
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-white">Drag & drop a CSV file here, or click to select a file.</p>
                </div>
              )}

              {file && (
                <div className="p-4 rounded-lg bg-slate-900/50 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-white font-semibold">File: {file.name}</p>
                    <Button variant="ghost" size="sm" onClick={() => { setFile(null); setParsedData([]); setErrors([]); }}>Change file</Button>
                  </div>
                  
                  {parsing && <div className="flex items-center text-gray-400"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>Parsing file...</div>}

                  {!parsing && (parsedData.length > 0 || errors.length > 0) && (
                    <div className="max-h-64 overflow-y-auto pr-2">
                      {errors.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-red-400 font-bold flex items-center"><XCircle className="h-4 w-4 mr-2"/> {errors.length} Validation Errors</h5>
                          <ul className="text-sm text-red-300 list-disc pl-5 mt-2">
                            {errors.slice(0, 5).map(err => <li key={err.index}>Row {err.index}: {err.error}</li>)}
                            {errors.length > 5 && <li>...and {errors.length-5} more.</li>}
                          </ul>
                        </div>
                      )}
                      {parsedData.length > 0 && (
                        <div>
                          <h5 className="text-green-400 font-bold flex items-center"><CheckCircle className="h-4 w-4 mr-2"/> {parsedData.length} Valid Records</h5>
                          <p className="text-sm text-gray-400 mt-1">Showing first 5 valid records for preview.</p>
                           <ul className="text-sm text-green-300 list-disc pl-5 mt-2">
                            {parsedData.slice(0, 5).map((row, i) => <li key={i}>{row.student_code || row.UserName}: {row.E_Child_Name || row.name}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="text-center">
                <Button variant="link" onClick={handleDownloadSample}>Download Sample CSV</Button>
              </div>
            </div>
            <Button onClick={handleUpload} disabled={parsedData.length === 0 || uploading || parsing} className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
              {uploading ? 'Syncing...' : `Sync ${parsedData.length} Valid Records`}
            </Button>
          </DialogContent>
        </Dialog>
      );
    };

    export default BulkUploadDialog;