import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white leading-tight">
            Unlock Academic Potential with
            <span className="block gradient-text mt-2">AI-Powered Insights</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-400">
            EduPortal is the futuristic command center for educational institutions, transforming student data into actionable intelligence for unparalleled growth.
          </p>
        </motion.div>
        
        <motion.div
          className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-lg rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-300">
            <Link to="/login">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-white border-slate-700 hover:bg-slate-800 hover:text-white">
            <Link to="#">Request a Demo</Link>
          </Button>
        </motion.div>

        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 100 }}
        >
          <div className="relative aspect-video max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10 rounded-xl"></div>
            <img  alt="EduPortal Dashboard Preview" className="rounded-xl shadow-2xl shadow-purple-500/20 border-2 border-slate-800" src="https://images.unsplash.com/photo-1516383274235-5f42d6c6426d" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}