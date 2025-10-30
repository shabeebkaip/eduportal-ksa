
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient.js';
import { useToast } from '@/components/ui/use-toast.js';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const forceSignOut = useCallback(() => {
    supabase.auth.signOut().catch(console.error);
    setSession(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.error?.message?.includes('Invalid Refresh Token')) {
        console.error("Invalid refresh token detected. Forcing sign out.");
        forceSignOut();
        toast({
            variant: "destructive",
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
        });
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN') {
        toast({
          title: "Sign in Successful",
          description: "Welcome back!",
        });
      } else if (event === 'SIGNED_OUT') {
        navigate('/login', { replace: true });
        toast({
            title: "Signed Out",
            description: "You have been successfully signed out.",
        });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(err => {
      console.error("Error getting session on load:", err);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast, navigate, forceSignOut]);

  const signUp = useCallback(async (email, password, options) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options });
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up Failed",
        description: error.message || "Something went wrong",
      });
    } else {
      toast({
        title: "Sign up Successful",
        description: "Please check your email to verify your account.",
      });
    }
    setLoading(false);
    return { error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in Failed",
        description: error.message || "Something went wrong",
      });
    }
    setLoading(false);
    return { error };
  }, [toast]);

  const studentParentLogin = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('student-parent-login', {
        body: { username, password },
      });

      if (error) throw error;

      if (data.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        if (sessionError) throw sessionError;
      } else {
        throw new Error(data.error || "An unknown error occurred.");
      }

    } catch (error) {
      const errorMessage = error.context?.body?.error || error.message || "Invalid username or password.";
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    
    const { error } = await supabase.auth.signOut();
    
    if (error && !error.message.includes('Session not found')) {
      toast({
          variant: "destructive",
          title: "Sign out Failed",
          description: error.message,
      });
    }
    
    // The onAuthStateChange handler will catch SIGNED_OUT and redirect.
    setIsLoggingOut(false);
  }, [toast, isLoggingOut]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    isLoggingOut,
    signUp,
    signIn,
    studentParentLogin,
    signOut,
  }), [user, session, loading, isLoggingOut, signUp, signIn, studentParentLogin, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
