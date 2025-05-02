
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

type AdminUser = {
  username: string;
  isAuthenticated: boolean;
};

export const useAdminAuth = () => {
  const [admin, setAdmin] = useState<AdminUser>({
    username: '',
    isAuthenticated: false
  });
  
  // Check if admin is already logged in from Supabase session
  useEffect(() => {
    const checkSession = async () => {
      // Get Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if this user is in the admins table
        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (adminData) {
          setAdmin({
            username: session.user.email || '',
            isAuthenticated: true
          });
          
          // Also store in localStorage for offline access
          localStorage.setItem('omniabot_admin', JSON.stringify({
            username: session.user.email || '',
            isAuthenticated: true
          }));
        } else {
          // Fallback to localStorage for compatibility with existing data
          const storedAdmin = localStorage.getItem('omniabot_admin');
          if (storedAdmin) {
            try {
              const parsedAdmin = JSON.parse(storedAdmin);
              setAdmin(parsedAdmin);
            } catch (error) {
              console.error('Failed to parse admin data:', error);
              localStorage.removeItem('omniabot_admin');
            }
          }
        }
      } else {
        // Fallback to localStorage for compatibility with existing data
        const storedAdmin = localStorage.getItem('omniabot_admin');
        if (storedAdmin) {
          try {
            const parsedAdmin = JSON.parse(storedAdmin);
            setAdmin(parsedAdmin);
          } catch (error) {
            console.error('Failed to parse admin data:', error);
            localStorage.removeItem('omniabot_admin');
          }
        }
      }
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if this user is in the admins table
          const { data: adminData } = await supabase
            .from('admins')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (adminData) {
            setAdmin({
              username: session.user.email || '',
              isAuthenticated: true
            });
            
            // Also store in localStorage for offline access
            localStorage.setItem('omniabot_admin', JSON.stringify({
              username: session.user.email || '',
              isAuthenticated: true
            }));
            
            toast.success("Admin login successful");
          } else {
            toast.error("User is not authorized as admin");
          }
        } else if (event === 'SIGNED_OUT') {
          setAdmin({ username: '', isAuthenticated: false });
          localStorage.removeItem('omniabot_admin');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Admin login function
  const login = async (username: string, password: string) => {
    try {
      // First, try to use Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password
      });
      
      if (error) {
        // If Supabase auth fails, fallback to hard-coded credentials for demo compatibility
        if (username === 'admin' && password === 'omnia2025') {
          const adminUser = { username, isAuthenticated: true };
          localStorage.setItem('omniabot_admin', JSON.stringify(adminUser));
          setAdmin(adminUser);
          return true;
        }
        return false;
      }
      
      if (data.user) {
        // Check if this user is in the admins table
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (adminError || !adminData) {
          // User is not an admin, sign them out
          await supabase.auth.signOut();
          return false;
        }
        
        // User is an admin
        const adminUser = { 
          username: data.user.email || username, 
          isAuthenticated: true 
        };
        localStorage.setItem('omniabot_admin', JSON.stringify(adminUser));
        setAdmin(adminUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Admin logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    localStorage.removeItem('omniabot_admin');
    setAdmin({ username: '', isAuthenticated: false });
  };

  return { admin, login, logout };
};
