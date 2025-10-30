import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/Marketing/Header';
import Hero from '@/components/Marketing/Hero';
import Features from '@/components/Marketing/Features';
import Testimonials from '@/components/Marketing/Testimonials';
import Footer from '@/components/Marketing/Footer';

export default function HomePage() {
  return (
    <div className="bg-slate-900 text-gray-300 antialiased">
      <Helmet>
          <title>EduPortal - Revolutionizing Education with AI</title>
          <meta name="description" content="EduPortal is a futuristic AI-powered SaaS platform designed to transform student performance analytics and provide actionable insights for educational institutions." />
          <meta property="og:title" content="EduPortal - Revolutionizing Education with AI" />
          <meta property="og:description" content="Unlock the full potential of your students with AI-driven analytics, personalized recommendations, and comprehensive performance tracking." />
      </Helmet>

      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-tr from-purple-600/30 to-cyan-600/30 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-tr from-blue-600/30 to-pink-600/30 rounded-full blur-3xl opacity-50 animate-pulse animation-delay-4000" />
      
        <Header />
        
        <main>
          <Hero />
          <Features />
          <Testimonials />
        </main>
        
        <Footer />
      </div>
    </div>
  );
}