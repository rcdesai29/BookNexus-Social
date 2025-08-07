const TOKEN_KEY = 'auth_token';

export const tokenService = {
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  getToken: () => localStorage.getItem(TOKEN_KEY),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
  getUser: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      // Common JWT fields: 'fullName', 'email', 'sub', etc.
      return {
        name: decoded.fullName || decoded.name,
        email: decoded.email || decoded.sub,
      };
    } catch {
      return null;
    }
  },
}; 