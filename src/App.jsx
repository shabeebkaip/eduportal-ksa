import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster.jsx';
import { AuthProvider } from '@/contexts/SupabaseAuthContext.jsx';
import { DataProvider } from '@/contexts/DataContext.jsx';
import { AcademicYearProvider } from '@/contexts/AcademicYearContext.jsx';
import { TermProvider } from '@/contexts/TermContext.jsx';
import { ThemeProvider } from "@/contexts/ThemeProvider.jsx";
import AppRoutes from '@/components/AppRoutes.jsx';
import _ from 'lodash';

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster />
        <div className="min-h-screen bg-background">
          <Helmet>
            <title>Edu Portal - Multi-School Performance Management Platform</title>
            <meta name="description" content="Advanced AI-powered platform for tracking, analyzing, and improving student performance across multiple schools with comprehensive analytics and insights." />
            <meta property="og:title" content="Edu Portal - Multi-School Performance Management Platform" />
            <meta property="og:description" content="Advanced AI-powered platform for tracking, analyzing, and improving student performance across multiple schools with comprehensive analytics and insights." />
          </Helmet>
          <AuthProvider>
            <AcademicYearProvider>
              <TermProvider>
                <DataProvider>
                  <AppRoutes />
                </DataProvider>
              </TermProvider>
            </AcademicYearProvider>
          </AuthProvider>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;