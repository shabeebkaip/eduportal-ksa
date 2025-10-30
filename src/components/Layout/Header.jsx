
import React from 'react';
import { Bell, UserCircle, Calendar, BookOpen, LogOut, Settings, Repeat, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useData } from '@/contexts/DataContext';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { useTerm } from '@/contexts/TermContext';
import { useToast } from '@/components/ui/use-toast';
import { ThemeToggle } from '@/components/Layout/ThemeToggle';

const formatRoleName = (role) => {
  return role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function Header({ title, children }) {
  const { user, signOut, isLoggingOut } = useAuth();
  const { academicYear } = useAcademicYear();
  const { term } = useTerm();
  const { availableRoles, activeRole, switchActiveRole } = useData();
  const { toast } = useToast();

  const handleUnimplemented = () => {
    toast({
      title: "🚧 Feature in Progress",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  // Only show academic year and term for school-related roles, not super-admin
  const showAcademicInfo = activeRole && activeRole !== 'super-admin';

  return (
    <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-30">
      <div className="px-6 h-20 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {children}
          {showAcademicInfo && (
            <div className="flex items-center space-x-4 bg-secondary/50 px-3 py-1.5 rounded-lg border">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-foreground">{academicYear || 'N/A'}</span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-foreground">{term?.name || 'N/A'}</span>
              </div>
            </div>
          )}
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={handleUnimplemented}>
            <Bell className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>{user?.user_metadata?.full_name || user?.email}</DropdownMenuLabel>
              <DropdownMenuLabel className="text-xs font-normal text-purple-400 -mt-2">
                Viewing as: {formatRoleName(activeRole || '')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableRoles.length > 1 && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Repeat className="mr-2 h-4 w-4" />
                    <span>Switch Role</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {availableRoles.map(role => (
                        <DropdownMenuItem key={role} onClick={() => switchActiveRole(role)}>
                           {activeRole === role && <Check className="mr-2 h-4 w-4" />}
                           {activeRole !== role && <span className="w-6 mr-2"></span>}
                          <span>{formatRoleName(role)}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              )}
              <DropdownMenuItem onClick={handleUnimplemented}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} disabled={isLoggingOut} className="text-red-500 focus:text-red-400 focus:bg-red-500/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
