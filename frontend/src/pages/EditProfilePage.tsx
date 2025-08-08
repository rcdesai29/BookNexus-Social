import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { UserProfileService, UserProfileRequest } from '../app/services/services/UserProfileService';

type LocalUserProfileRequest = UserProfileRequest;

const EditProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<LocalUserProfileRequest>({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    twitterHandle: '',
    instagramHandle: '',
    goodreadsHandle: '',
    profileVisibility: 'PUBLIC',
    activityVisibility: 'PUBLIC',
    reviewsVisibility: 'PUBLIC',
    annualReadingGoal: undefined,
    preferredFormat: '',
    readingSpeed: ''
  });

  useEffect(() => {
    if (!userId) return;
    
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await UserProfileService.getUserProfile(parseInt(userId));
        
        setFormData({
          displayName: profileData.displayName || '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          website: profileData.website || '',
          twitterHandle: profileData.twitterHandle || '',
          instagramHandle: profileData.instagramHandle || '',
          goodreadsHandle: profileData.goodreadsHandle || '',
          profileVisibility: profileData.profileVisibility as 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS_ONLY',
          activityVisibility: profileData.activityVisibility as 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS_ONLY',
          reviewsVisibility: profileData.reviewsVisibility as 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS_ONLY',
          annualReadingGoal: profileData.annualReadingGoal || undefined,
          preferredFormat: profileData.preferredFormat || '',
          readingSpeed: profileData.readingSpeed || ''
        });
      } catch (err: any) {
        setError(err?.body?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleInputChange = (field: keyof LocalUserProfileRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setSaving(true);
      setError(null);
      
      await UserProfileService.updateUserProfile(parseInt(userId), formData);
      setSuccess('Profile updated successfully!');
      
      // Redirect to profile page after a short delay
      setTimeout(() => {
        navigate(`/profile/${userId}`);
      }, 1500);
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Edit Profile
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gap: 3 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Display Name"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                helperText="How others will see your name"
              />
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                multiline
                rows={3}
                helperText="Tell others about yourself (max 500 characters)"
                inputProps={{ maxLength: 500 }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                helperText="City, Country"
              />

              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                helperText="Your personal website or blog"
              />
            </Box>

            {/* Social Links */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Social Links
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Twitter Handle"
                value={formData.twitterHandle}
                onChange={(e) => handleInputChange('twitterHandle', e.target.value)}
                helperText="@username"
              />

              <TextField
                fullWidth
                label="Instagram Handle"
                value={formData.instagramHandle}
                onChange={(e) => handleInputChange('instagramHandle', e.target.value)}
                helperText="@username"
              />

              <TextField
                fullWidth
                label="Goodreads Handle"
                value={formData.goodreadsHandle}
                onChange={(e) => handleInputChange('goodreadsHandle', e.target.value)}
                helperText="Goodreads username"
              />
            </Box>

            {/* Reading Preferences */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Reading Preferences
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="Annual Reading Goal"
                value={formData.annualReadingGoal || ''}
                onChange={(e) => handleInputChange('annualReadingGoal', e.target.value ? parseInt(e.target.value) : undefined)}
                helperText="Number of books you want to read this year"
              />

              <FormControl fullWidth>
                <InputLabel>Preferred Format</InputLabel>
                <Select
                  value={formData.preferredFormat}
                  label="Preferred Format"
                  onChange={(e) => handleInputChange('preferredFormat', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="PHYSICAL">Physical Books</MenuItem>
                  <MenuItem value="EBOOK">E-Books</MenuItem>
                  <MenuItem value="AUDIOBOOK">Audiobooks</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr' }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Reading Speed</InputLabel>
                <Select
                  value={formData.readingSpeed}
                  label="Reading Speed"
                  onChange={(e) => handleInputChange('readingSpeed', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="FAST">Fast Reader</MenuItem>
                  <MenuItem value="AVERAGE">Average Reader</MenuItem>
                  <MenuItem value="SLOW">Slow Reader</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Privacy Settings */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Privacy Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Profile Visibility</InputLabel>
                <Select
                  value={formData.profileVisibility}
                  label="Profile Visibility"
                  onChange={(e) => handleInputChange('profileVisibility', e.target.value)}
                >
                  <MenuItem value="PUBLIC">Public</MenuItem>
                  <MenuItem value="PRIVATE">Private</MenuItem>
                  <MenuItem value="FOLLOWERS_ONLY">Followers Only</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Activity Visibility</InputLabel>
                <Select
                  value={formData.activityVisibility}
                  label="Activity Visibility"
                  onChange={(e) => handleInputChange('activityVisibility', e.target.value)}
                >
                  <MenuItem value="PUBLIC">Public</MenuItem>
                  <MenuItem value="PRIVATE">Private</MenuItem>
                  <MenuItem value="FOLLOWERS_ONLY">Followers Only</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Reviews Visibility</InputLabel>
                <Select
                  value={formData.reviewsVisibility}
                  label="Reviews Visibility"
                  onChange={(e) => handleInputChange('reviewsVisibility', e.target.value)}
                >
                  <MenuItem value="PUBLIC">Public</MenuItem>
                  <MenuItem value="PRIVATE">Private</MenuItem>
                  <MenuItem value="FOLLOWERS_ONLY">Followers Only</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Action Buttons */}
            <Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={20} /> : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default EditProfilePage;
