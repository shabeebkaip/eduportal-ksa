import React from 'react';
import { BookOpen } from 'lucide-react';
import { useTerm } from '@/contexts/TermContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TermSelector() {
  const { term, availableTerms, changeTerm, loading } = useTerm();

  if (loading) {
    return (
      <div className="w-48 h-10 bg-slate-800 rounded-md animate-pulse" />
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Select value={term?.id.toString() || ''} onValueChange={changeTerm} disabled={availableTerms.length === 0}>
        <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
          <BookOpen className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Select Term" />
        </SelectTrigger>
        <SelectContent className="glass-effect border-white/10">
          {availableTerms.map(t => (
            <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}