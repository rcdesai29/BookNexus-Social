const TOKEN_KEY = 'auth_token';

// Helper function to dispatch auth state change events
const dispatchAuthChange = () => {
  window.dispatchEvent(new CustomEvent('authStateChange'));
};

export const tokenService = {
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    dispatchAuthChange();
  },
  getToken: () => localStorage.getItem(TOKEN_KEY),
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    dispatchAuthChange();
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    dispatchAuthChange();
    // Redirect to login page
    window.location.href = '/login';
  },
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
  getUser: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      // Common JWT fields: 'fullName', 'email', 'sub', etc.
      return {
        id: decoded.userId || decoded.id || 1, // Default to 1 if not found
        name: decoded.fullName || decoded.name,
        email: decoded.email || decoded.sub,
      };
    } catch {
      return null;
    }
  },
  isTokenExpired: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return true;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      const exp = decoded.exp;
      if (!exp) return false;
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  },
}; 