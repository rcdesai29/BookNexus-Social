import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  IoMenu, 
  IoSearch, 
  IoClose 
} from 'react-icons/io5';
import { tokenService } from '../services/tokenService';

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = tokenService.isLoggedIn();
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        setUser(tokenService.getUser());
      }
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    tokenService.removeToken();
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/books?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Home', to: '/books', show: true },
    { label: 'My Books', to: '/my-books', show: isLoggedIn },
    { label: 'Currently Reading', to: '/borrowed-books', show: isLoggedIn },
    { label: 'TBR', to: '/tbr', show: isLoggedIn },
    { label: 'Read', to: '/read', show: isLoggedIn },
    { label: 'Add to Library', to: '/add-book', show: isLoggedIn },
  ];

  const filteredLinks = navLinks.filter(link => link.show);

  return (
    <>
      {/* Main Navigation */}
      <nav className="bg-white/70 backdrop-blur-lg border-b border-amber-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link 
                to="/books" 
                className="font-playfair text-2xl font-bold text-amber-900 hover:text-orange-600 transition-colors duration-200"
              >
                BookNexus
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search books..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-amber-300 rounded-lg bg-white/80 backdrop-blur-sm text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 w-80"
                  />
                </div>
              </form>

              {/* Navigation Links */}
              <div className="flex items-center space-x-6">
                <Link
                  to="/books"
                  className="text-amber-800 hover:text-orange-600 font-medium transition-colors duration-200"
                >
                  Home
                </Link>
                {isLoggedIn && (
                  <Link
                    to="/my-books"
                    className="text-amber-800 hover:text-orange-600 font-medium transition-colors duration-200"
                  >
                    My Books
                  </Link>
                )}
                <Link
                  to="/books"
                  className="text-amber-800 hover:text-orange-600 font-medium transition-colors duration-200"
                >
                  Browse
                </Link>
              </div>

              {/* User Section */}
              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <Link
                    to={`/profile/${user?.id || 1}`}
                    className="text-amber-800 hover:text-orange-600 font-medium transition-colors duration-200"
                  >
                    {user?.name || user?.email || 'User'}
                  </Link>
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-amber-800 hover:text-red-600 font-medium transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-amber-800 hover:text-orange-600 font-medium px-4 py-2 border border-amber-300 rounded-lg transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-orange-600 to-orange-700 text-white font-medium px-4 py-2 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setDrawerOpen(true)}
                className="text-amber-800 hover:text-orange-600 p-2 transition-colors duration-200"
              >
                <IoMenu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setDrawerOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed left-0 top-0 h-full w-80 bg-vintage-cream shadow-xl transform transition-transform duration-300">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-playfair text-2xl font-bold text-amber-900">
                  BookNexus
                </h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-amber-800 hover:text-orange-600 p-1 transition-colors duration-200"
                >
                  <IoClose className="w-6 h-6" />
                </button>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search books..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-amber-300 rounded-lg bg-white/80 backdrop-blur-sm text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </form>

              {/* Navigation Links */}
              <nav className="space-y-2">
                {filteredLinks.map(link => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setDrawerOpen(false)}
                    className="block px-4 py-3 text-amber-800 hover:bg-white/50 hover:text-orange-600 rounded-lg transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
                
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setDrawerOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-amber-800 hover:bg-white/50 hover:text-red-600 rounded-lg transition-all duration-200"
                  >
                    Logout
                  </button>
                ) : (
                  <div className="space-y-2 pt-4">
                    <Link
                      to="/login"
                      onClick={() => setDrawerOpen(false)}
                      className="block w-full text-center px-4 py-3 text-amber-800 border border-amber-300 rounded-lg hover:bg-white/50 transition-all duration-200"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setDrawerOpen(false)}
                      className="block w-full text-center px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </nav>

              {/* User Info */}
              {isLoggedIn && (
                <div className="mt-6 pt-6 border-t border-amber-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-medium">
                      {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-amber-900">
                        {user?.name || user?.email || 'User'}
                      </p>
                      <Link
                        to={`/profile/${user?.id || 1}`}
                        onClick={() => setDrawerOpen(false)}
                        className="text-sm text-orange-600 hover:text-orange-700 transition-colors duration-200"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;