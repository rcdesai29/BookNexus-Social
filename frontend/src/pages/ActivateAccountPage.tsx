import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticationService } from '../app/services/services/AuthenticationService';

const ActivateAccountPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await AuthenticationService.confirm(code);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err?.body?.message || 'Activation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>Activate Account</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Please enter the 6-digit activation code sent to your email.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Account activated! Redirecting to login...</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Activation Code"
          value={code}
          onChange={e => setCode(e.target.value)}
          fullWidth
          margin="normal"
          required
          inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading || code.length !== 6} sx={{ mt: 2 }}>
          {loading ? 'Activating...' : 'Activate'}
        </Button>
      </Box>
    </Container>
  );
};

export default ActivateAccountPage; 