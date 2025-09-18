import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Check, X } from '@mui/icons-material';
import { profileService } from '../services/profileService';
import { API_CONFIG } from '../config/api';

const DisplayNameSetupPage: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Debounce availability check
  useEffect(() => {
    if (!displayName || displayName.length < 3) {
      setIsAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsChecking(true);
      try {
        const available = await profileService.checkDisplayNameAvailability(displayName);
        setIsAvailable(available);
        setError('');
      } catch (err) {
        setError('Failed to check availability');
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [displayName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName || !isAvailable || !token) {
      return;
    }

    setLoading(true);
    try {
      // Call backend to complete account setup with displayName
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/complete-setup?token=${encodeURIComponent(token)}&displayName=${encodeURIComponent(displayName)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        navigate('/login', { 
          state: { 
            message: 'Account setup completed successfully! You can now log in with your new display name.',
            displayName 
          }
        });
      } else {
        const errorText = await response.text();
        if (errorText.includes('already taken')) {
          setError('Display name is already taken. Please choose another one.');
        } else {
          setError('Failed to complete account setup. Please try again.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '');
    setDisplayName(value);
  };

  const getAvailabilityIcon = () => {
    if (isChecking) return <CircularProgress size={20} />;
    if (isAvailable === true) return <Check color="success" />;
    if (isAvailable === false) return <X color="error" />;
    return null;
  };

  const getAvailabilityMessage = () => {
    if (displayName.length < 3) return 'Display name must be at least 3 characters';
    if (isChecking) return 'Checking availability...';
    if (isAvailable === true) return 'Available!';
    if (isAvailable === false) return 'Already taken';
    return '';
  };

  const getAvailabilityColor = () => {
    if (displayName.length < 3) return 'default';
    if (isAvailable === true) return 'success';
    if (isAvailable === false) return 'error';
    return 'default';
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ 
          fontFamily: 'Playfair Display, serif',
          color: '#3C2A1E',
          mb: 3
        }}>
          Choose Your Display Name
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
          Your display name is how other readers will find and recognize you. 
          Choose something unique that represents you!
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Display Name"
            value={displayName}
            onChange={handleDisplayNameChange}
            placeholder="e.g., bookworm_jane, scifi_reader, jane_doe"
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <Typography color="textSecondary">@</Typography>,
              endAdornment: getAvailabilityIcon(),
            }}
            helperText="3-30 characters. Letters, numbers, dots, underscores, and hyphens only."
            error={isAvailable === false}
          />

          {displayName && (
            <Box sx={{ mb: 3 }}>
              <Chip 
                label={getAvailabilityMessage()}
                color={getAvailabilityColor() as any}
                variant={isAvailable === true ? "filled" : "outlined"}
              />
            </Box>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={!isAvailable || loading}
            sx={{
              mt: 2,
              py: 2,
              background: 'linear-gradient(45deg, #B8956A, #D2A441)',
              '&:hover': {
                background: 'linear-gradient(45deg, #9D7F56, #B8956A)',
              },
              '&:disabled': {
                background: '#ccc',
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Complete Setup'}
          </Button>

          <Typography variant="body2" sx={{ mt: 2, color: '#666' }}>
            <strong>Note:</strong> This is a one-time setup. Your display name cannot be changed once set, so choose carefully!
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default DisplayNameSetupPage;