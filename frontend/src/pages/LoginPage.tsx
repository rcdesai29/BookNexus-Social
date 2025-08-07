import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthenticationService } from '../app/services/services/AuthenticationService';
import { tokenService } from '../services/tokenService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

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
        setSuccess(true);
        setTimeout(() => navigate('/books'), 1000);
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
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>Login</Typography>
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
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Box>
      <Box sx={{ mt: 2 }}>
        Don&apos;t have an account? <Link to="/register">Register here</Link>
      </Box>
    </Container>
  );
};

export default LoginPage; 