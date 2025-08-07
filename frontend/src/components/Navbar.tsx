import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Button, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, TextField, Toolbar, Typography, useMediaQuery } from '@mui/material';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tokenService } from '../services/tokenService';

// Note: Navigation tab names are user-friendly but route to original page names
// Home -> /books (BookListPage), Currently Reading -> /borrowed-books (BorrowedBooksPage), etc.

const navLinks = [
  { label: 'Home', to: '/books', always: true },
  { label: 'My Books', to: '/my-books', auth: true },
  { label: 'Currently Reading', to: '/borrowed-books', auth: true },
  { label: 'TBR', to: '/tbr', auth: true },
  { label: 'Read', to: '/read', auth: true },
  { label: 'Add to Library', to: '/add-book', auth: true },
  { label: 'Login', to: '/login', guest: true },
  { label: 'Register', to: '/register', guest: true },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = tokenService.isLoggedIn();
  const user = tokenService.getUser();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:900px)');

  const handleLogout = () => {
    tokenService.removeToken();
    navigate('/login');
    setDrawerOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic or navigation here
    setDrawerOpen(false);
  };

  const filteredLinks = navLinks.filter(link =>
    link.always || (isLoggedIn && link.auth) || (!isLoggedIn && link.guest)
  );

  const drawerContent = (
    <Box sx={{ width: 250, p: 2 }} role="presentation" onClick={() => setDrawerOpen(false)}>
      <Typography variant="h6" sx={{ mb: 2 }} component={Link} to="/books" style={{ textDecoration: 'none', color: 'inherit' }}>
        BookNexus
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {filteredLinks.map(link => (
          <ListItem key={link.label} disablePadding>
            <ListItemButton component={Link} to={link.to}>
              <ListItemText primary={link.label} />
            </ListItemButton>
          </ListItem>
        ))}
        {isLoggedIn && (
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      {isLoggedIn && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              fullWidth
            />
          </Box>
          <Typography variant="body1" sx={{ color: 'inherit', whiteSpace: 'nowrap' }}>
            Welcome {user?.name || user?.email || 'User'}
          </Typography>
        </>
      )}
    </Box>
  );

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left: App Name */}
        <Typography variant="h6" component={Link} to="/books" sx={{ color: 'inherit', textDecoration: 'none', mr: 4, display: { xs: 'block', md: 'block' } }}>
          BookNexus
        </Typography>
        {isMobile ? (
          <>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton color="inherit" edge="end" onClick={() => setDrawerOpen(true)} sx={{ ml: 'auto' }}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              {drawerContent}
            </Drawer>
          </>
        ) : (
          <>
            {/* Spacer to push nav links to the right */}
            <Box sx={{ flexGrow: 1 }} />
            {/* Center/Right: Navigation Links */}
            <Stack direction="row" spacing={2}>
              <Button color="inherit" component={Link} to="/books">Home</Button>
              {isLoggedIn && <Button color="inherit" component={Link} to="/my-books">My Books</Button>}
              {isLoggedIn && <Button color="inherit" component={Link} to="/borrowed-books">Currently Reading</Button>}
              {isLoggedIn && <Button color="inherit" component={Link} to="/tbr">TBR</Button>}
              {isLoggedIn && <Button color="inherit" component={Link} to="/read">Read</Button>}
              {isLoggedIn && <Button color="inherit" component={Link} to="/add-book">Add to Library</Button>}
              {!isLoggedIn && <Button color="inherit" component={Link} to="/login">Login</Button>}
              {!isLoggedIn && <Button color="inherit" component={Link} to="/register">Register</Button>}
              {isLoggedIn && <Button color="inherit" onClick={handleLogout}>Logout</Button>}
            </Stack>
            {/* Right: Search bar and Welcome */}
            {isLoggedIn && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 4 }}>
                <Box component="form" onSubmit={handleSearch} sx={{ mr: 2 }}>
                  <TextField
                    size="small"
                    variant="outlined"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    sx={{ bgcolor: 'background.paper', borderRadius: 1, minWidth: 150 }}
                    InputProps={{ sx: { height: 36 } }}
                  />
                </Box>
                <Typography variant="body1" sx={{ color: 'inherit', whiteSpace: 'nowrap' }}>
                  Welcome {user?.name || user?.email || 'User'}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 