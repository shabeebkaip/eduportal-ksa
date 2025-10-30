import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Twitter, Linkedin, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  const footerLinks = [
    {
      title: 'Product',
      links: ['Features', 'Pricing', 'Integrations', 'Updates']
    },
    {
      title: 'Company',
      links: ['About Us', 'Careers', 'Blog', 'Contact']
    },
    {
      title: 'Resources',
      links: ['Help Center', 'API Docs', 'Security', 'Case Studies']
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
    }
  ];

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <BrainCircuit className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">EduPortal</span>
            </Link>
            <p className="text-gray-400 max-w-sm">
              The AI-powered platform for modern educational institutions.
            </p>
            <div className="pt-4">
              <p className="font-semibold text-white mb-2">Subscribe to our newsletter</p>
              <form className="flex space-x-2">
                <Input type="email" placeholder="Enter your email" className="bg-slate-800 border-slate-700 text-white" />
                <Button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white">Subscribe</Button>
              </form>
            </div>
          </div>
          
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <p className="font-semibold text-white mb-4">{section.title}</p>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500">&copy; {new Date().getFullYear()} EduPortal Inc. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white"><Twitter className="w-5 h-5"/></a>
            <a href="#" className="text-gray-400 hover:text-white"><Linkedin className="w-5 h-5"/></a>
            <a href="#" className="text-gray-400 hover:text-white"><Facebook className="w-5 h-5"/></a>
          </div>
        </div>
      </div>
    </footer>
  );
}