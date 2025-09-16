import { Alert, Box, Button, Container, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthenticationService } from '../app/services/services/AuthenticationService';
import { tokenService } from '../services/tokenService';
import { initializeWebSocket } from '../services/WebSocketService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const errors: string[] = [];
    if (!email) errors.push('Email is mandatory');
    if (!password) errors.push('Password is mandatory');
    if (password && password.length < 8) errors.push('Password should be at least 8 characters long');
    setValidationErrors(errors);
    if (errors.length > 0) return;

    setLoading(true);
    try {
      const response = await AuthenticationService.authenticate({ email, password });
      if (response && response.token) {
        tokenService.setToken(response.token);
        // Initialize WebSocket connection after successful login
        initializeWebSocket();
        setSuccess(true);
        setTimeout(() => navigate('/'), 1000);
      } else {
        setError('No token received from server');
      }
    } catch (err: any) {
      setError(err?.body?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F4E3C1, #E6D7C3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '16px' : '24px'
    }}>
      <Container 
        maxWidth="xs" 
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(75, 63, 48, 0.15)',
          border: '1px solid rgba(230, 215, 195, 0.3)',
          padding: isMobile ? 3 : 4
        }}
      >
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          gutterBottom 
          sx={{
            textAlign: 'center',
            fontFamily: 'Playfair Display, serif',
            color: '#4B3F30',
            fontWeight: 700,
            mb: 3
          }}
        >
          Welcome Back
        </Typography>
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validationErrors.map((err, idx) => <li key={idx}>{err}</li>)}
          </ul>
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Login successful!</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
          sx={{
            '& .MuiOutlinedInput-root': {
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
            '& .MuiInputLabel-root': {
              fontFamily: 'Inter, sans-serif',
            },
            '& .MuiInputBase-input': {
              fontFamily: 'Inter, sans-serif',
            }
          }}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
          sx={{
            '& .MuiOutlinedInput-root': {
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
            '& .MuiInputLabel-root': {
              fontFamily: 'Inter, sans-serif',
            },
            '& .MuiInputBase-input': {
              fontFamily: 'Inter, sans-serif',
            }
          }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth 
          disabled={loading} 
          sx={{ 
            mt: 3,
            mb: 2,
            py: isMobile ? 1.5 : 2,
            borderRadius: '12px',
            background: 'linear-gradient(45deg, #B8956A, #D2A441)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: isMobile ? '14px' : '16px',
            textTransform: 'none',
            boxShadow: '0 4px 15px rgba(184, 149, 106, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #9D7F56, #B8956A)',
              boxShadow: '0 6px 20px rgba(184, 149, 106, 0.4)'
            },
            '&:disabled': {
              background: 'linear-gradient(45deg, #E6D7C3, #F4E3C1)',
              color: '#8B7355'
            }
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Box>
        <Box sx={{ 
          mt: 2, 
          textAlign: 'center',
          fontSize: isMobile ? '14px' : '16px',
          fontFamily: 'Inter, sans-serif',
          color: '#6A5E4D'
        }}>
          Don&apos;t have an account?{' '}
          <Link 
            to="/register"
            style={{
              color: '#B8956A',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Register here
          </Link>
        </Box>
      </Container>
    </div>
  );
};

export default LoginPage; 