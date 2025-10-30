import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Pricing', href: '#' },
    { name: 'Contact', href: '#' },
  ];

  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || mobileMenuOpen ? 'bg-slate-900/80 backdrop-blur-lg border-b border-slate-800' : 'bg-transparent'}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <BrainCircuit className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">EduPortal</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a key={item.name} href={item.href} className="text-gray-300 hover:text-white transition-colors duration-200">
                {item.name}
              </a>
            ))}
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-white hover:bg-slate-800" asChild>
                <Link to="/login">Sign In</Link>
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-300" asChild>
                <Link to="/login">Get Started</Link>
            </Button>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </Button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden py-4 border-t border-slate-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a key={item.name} href={item.href} className="text-gray-300 hover:text-white text-center py-2 rounded-md hover:bg-slate-800 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
                  {item.name}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-slate-800">
                <Button variant="ghost" className="text-white hover:bg-slate-800" asChild>
                    <Link to="/login">Sign In</Link>
                </Button>
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg" asChild>
                    <Link to="/login">Get Started</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}