
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
  const [loading, setLoading] = useState(true);
  
  // Check if admin is already logged in from Supabase session
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      
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
          const adminUser = {
            username: session.user.email || '',
            isAuthenticated: true
          };
          setAdmin(adminUser);
        }
      }
      
      setLoading(false);
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
            const adminUser = {
              username: session.user.email || '',
              isAuthenticated: true
            };
            setAdmin(adminUser);
            toast.success("Admin login successful");
          } else {
            toast.error("User is not authorized as admin");
          }
        } else if (event === 'SIGNED_OUT') {
          setAdmin({ username: '', isAuthenticated: false });
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Admin login function - only Supabase authentication
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      // Use Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password
      });
      
      if (!error && data.user) {
        // Check if this user is in the admins table
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (!adminError && adminData) {
          // User is an admin
          const adminUser = { 
            username: data.user.email || username, 
            isAuthenticated: true 
          };
          setAdmin(adminUser);
          toast.success("Admin login successful");
          setLoading(false);
          return true;
        } else {
          // User is not an admin, sign them out
          await supabase.auth.signOut();
          toast.error("User is not authorized as admin");
          setLoading(false);
          return false;
        }
      }
      
      toast.error("Invalid admin credentials");
      setLoading(false);
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      setLoading(false);
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
    
    setAdmin({ username: '', isAuthenticated: false });
    toast.success("Logged out successfully");
  };

  return { admin, login, logout, loading };
};
