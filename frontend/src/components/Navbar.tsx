import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  TextField,
  Stack,
  useMediaQuery,
  useTheme,
  Avatar,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../hooks/useAuth';
import { tokenService } from '../services/tokenService';

const Navbar: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    tokenService.removeToken();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Home', to: '/', show: true },
    { label: 'Search', to: '/search', show: true },
    { label: 'My Books', to: '/my-books', show: isLoggedIn },
    { label: 'Currently Reading', to: '/currently-reading', show: isLoggedIn },
    { label: 'TBR', to: '/tbr', show: isLoggedIn },
    { label: 'Read', to: '/read', show: isLoggedIn },
  ];

  const filteredLinks = navLinks.filter(link => link.show);

  const drawerContent = (
    <Box sx={{ width: 280, p: 3, bgcolor: '#FDF8F1', height: '100%' }}>
      <Typography 
        variant="h4" 
        component="div" 
        sx={{
          fontFamily: 'Playfair Display, serif',
          color: '#3C2A1E',
          mb: 3,
          fontWeight: 700
        }}
      >
        BookNexus
      </Typography>
      <Divider sx={{ mb: 3, borderColor: '#E6D7C3' }} />
      <List>
        {filteredLinks.map(link => (
          <ListItem key={link.label} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={Link}
              to={link.to}
              onClick={() => setDrawerOpen(false)}
              sx={{
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: '#F7F1E8',
                  color: '#B8956A'
                }
              }}
            >
              <ListItemText
                primary={link.label}
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#3C2A1E'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        {isLoggedIn && (
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => {
                handleLogout();
                setDrawerOpen(false);
              }}
              sx={{
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: '#F7F1E8',
                  color: '#B8956A'
                }
              }}
            >
              <ListItemText
                primary="Logout"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#3C2A1E'
                }}
              />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      {isLoggedIn && (
        <>
          <Divider sx={{ my: 3, borderColor: '#E6D7C3' }} />
          <Box component="form" onSubmit={handleSearch}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Search books..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderColor: '#E6D7C3',
                  borderRadius: '12px',
                  '& fieldset': {
                    borderColor: '#E6D7C3',
                  },
                  '&:hover fieldset': {
                    borderColor: '#B8956A',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#B8956A',
                  },
                },
                '& .MuiInputBase-input': {
                  fontFamily: 'Inter, sans-serif',
                  color: '#3C2A1E',
                }
              }}
            />
          </Box>
        </>
      )}
      {isLoggedIn && user && (
        <>
          <Divider sx={{ my: 3, borderColor: '#E6D7C3' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#B8956A',
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem'
              }}
            >
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </Avatar>
            <Typography
              variant="body1"
              component={Link}
              to={`/profile/${user?.id || 1}`}
              onClick={() => setDrawerOpen(false)}
              sx={{
                color: '#3C2A1E',
                textDecoration: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                '&:hover': {
                  color: '#B8956A',
                  textDecoration: 'underline'
                }
              }}
            >
              {user?.name || user?.email || 'User'}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(139, 115, 85, 0.15)',
        borderBottom: '1px solid #E6D7C3'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, py: 1 }}>
        {/* Left: App Name */}
        <Typography
          variant="h4"
          component={Link}
          to="/"
          sx={{
            color: '#3C2A1E',
            textDecoration: 'none',
            mr: 4,
            fontFamily: 'Playfair Display, serif',
            fontWeight: 700,
            fontSize: { xs: '1.5rem', md: '2rem' }
          }}
        >
          BookNexus
        </Typography>

        {isMobile ? (
          <>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              color="inherit"
              edge="end"
              onClick={() => setDrawerOpen(true)}
              sx={{
                ml: 'auto',
                color: '#3C2A1E',
                '&:hover': {
                  backgroundColor: '#F7F1E8'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              PaperProps={{
                sx: {
                  backgroundColor: '#FDF8F1',
                  borderRight: '1px solid #E6D7C3'
                }
              }}
            >
              {drawerContent}
            </Drawer>
          </>
        ) : (
          <>
            {/* Center: Search Bar */}
            <Box sx={{ flexGrow: 1, maxWidth: 400, mx: 4 }}>
              <Box component="form" onSubmit={handleSearch}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Search books, authors, genres..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: '#8B7355', mr: 1 }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderColor: '#E6D7C3',
                      borderRadius: '12px',
                      '& fieldset': {
                        borderColor: '#E6D7C3',
                      },
                      '&:hover fieldset': {
                        borderColor: '#B8956A',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#B8956A',
                      },
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: 'Inter, sans-serif',
                      color: '#3C2A1E',
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Right: Navigation Links */}
            <Stack direction="row" spacing={1} sx={{ mr: 3 }}>
              {filteredLinks.map(link => (
                <Button
                  key={link.label}
                  color="inherit"
                  component={Link}
                  to={link.to}
                  sx={{
                    color: '#3C2A1E',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    px: 2,
                    py: 1,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    '&:hover': {
                      backgroundColor: '#F7F1E8',
                      color: '#B8956A'
                    }
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Stack>

            {/* Right: User Avatar/Login */}
            {isLoggedIn ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  variant="body1"
                  component={Link}
                  to={`/profile/${user?.id || 1}`}
                  sx={{
                    color: '#3C2A1E',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    '&:hover': {
                      color: '#B8956A',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {user?.name || user?.email || 'User'}
                </Typography>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: '#B8956A',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                  component={Link}
                  to={`/profile/${user?.id || 1}`}
                >
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </Avatar>
                <Button
                  onClick={handleLogout}
                  sx={{
                    color: '#8B7355',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    px: 2,
                    py: 1,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    '&:hover': {
                      backgroundColor: '#F7F1E8',
                      color: '#B8956A'
                    }
                  }}
                >
                  Logout
                </Button>
              </Box>
            ) : (
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/register"
                  sx={{
                    background: 'linear-gradient(45deg, #B8956A, #D2A441)',
                    color: 'white',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    px: 3,
                    py: 1,
                    borderRadius: '8px',
                    textTransform: 'none',
                    boxShadow: '0 2px 10px rgba(184, 149, 106, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #9D7F56, #B8956A)',
                      boxShadow: '0 4px 15px rgba(184, 149, 106, 0.4)'
                    }
                  }}
                >
                  Create Account
                </Button>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/login"
                  sx={{
                    color: '#3C2A1E',
                    borderColor: '#E6D7C3',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    px: 3,
                    py: 1,
                    borderRadius: '8px',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#F7F1E8',
                      borderColor: '#B8956A',
                      color: '#B8956A'
                    }
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;