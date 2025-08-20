import { useState, useEffect } from 'react';
import { tokenService } from '../services/tokenService';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(tokenService.isLoggedIn());
  const [user, setUser] = useState(tokenService.getUser());

  useEffect(() => {
    const checkAuthStatus = () => {
      const loggedIn = tokenService.isLoggedIn();
      const currentUser = tokenService.getUser();
      
      setIsLoggedIn(loggedIn);
      setUser(currentUser);
    };

    // Check auth status immediately
    checkAuthStatus();

    // Listen for storage changes (when token is set/removed in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Listen for custom auth events (when token is set/removed in same tab)
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('authStateChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChange', handleAuthChange);
    };
  }, []);

  return { isLoggedIn, user };
}