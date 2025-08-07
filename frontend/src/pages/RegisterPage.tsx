import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthenticationService } from '../app/services/services/AuthenticationService';

const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const errors: string[] = [];
    if (!firstName) errors.push('First name is mandatory');
    if (!lastName) errors.push('Last name is mandatory');
    if (!email) errors.push('Email is mandatory');
    if (!password) errors.push('Password is mandatory');
    if (password && password.length < 8) errors.push('Password should be at least 8 characters long');
    if (password !== confirmPassword) errors.push('Passwords do not match');
    setValidationErrors(errors);
    if (errors.length > 0) return;

    setLoading(true);
    try {
      await AuthenticationService.register({ firstName, lastName, email, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.body?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>Register</Typography>
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validationErrors.map((err, idx) => <li key={idx}>{err}</li>)}
          </ul>
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Registration successful! Please check your email to activate your account.</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="First Name"
          type="text"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Last Name"
          type="text"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
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
        <TextField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </Box>
      <Box sx={{ mt: 2 }}>
        Already have an account? <Link to="/login">Login here</Link>
      </Box>
    </Container>
  );
};

export default RegisterPage; 