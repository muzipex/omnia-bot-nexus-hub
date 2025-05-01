
import { useState, useEffect } from 'react';

type AdminUser = {
  username: string;
  isAuthenticated: boolean;
};

export const useAdminAuth = () => {
  const [admin, setAdmin] = useState<AdminUser>({
    username: '',
    isAuthenticated: false
  });

  // Check if admin is already logged in from localStorage
  useEffect(() => {
    const storedAdmin = localStorage.getItem('omniabot_admin');
    if (storedAdmin) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin);
        setAdmin(parsedAdmin);
      } catch (error) {
        console.error('Failed to parse admin data:', error);
        // Clear invalid data
        localStorage.removeItem('omniabot_admin');
      }
    }
  }, []);

  // Admin login function
  const login = (username: string, password: string) => {
    // Hard-coded credentials for demo purposes
    // In a real app, this should be a secure authentication system
    if (username === 'admin' && password === 'omnia2025') {
      const adminUser = { username, isAuthenticated: true };
      localStorage.setItem('omniabot_admin', JSON.stringify(adminUser));
      setAdmin(adminUser);
      return true;
    }
    return false;
  };

  // Admin logout function
  const logout = () => {
    localStorage.removeItem('omniabot_admin');
    setAdmin({ username: '', isAuthenticated: false });
  };

  return { admin, login, logout };
};
