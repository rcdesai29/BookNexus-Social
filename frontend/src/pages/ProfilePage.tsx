import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Language as WebsiteIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Book as BookIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  RateReview as ReviewIcon,
  People as PeopleIcon,
  Add as FollowIcon,
  Check as FollowingIcon
} from '@mui/icons-material';
import { UserProfileService, UserProfileResponse } from '../app/services/services/UserProfileService';
import { tokenService } from '../services/tokenService';

type UserProfile = UserProfileResponse;

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await UserProfileService.getUserProfile(parseInt(userId));
        setProfile(profileData);
      } catch (err: any) {
        setError(err?.body?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleFollow = async () => {
    if (!profile || !userId) return;
    
    try {
      setFollowLoading(true);
      if (profile.isFollowing) {
        await UserProfileService.unfollowUser(parseInt(userId));
        setProfile(prev => prev ? { ...prev, isFollowing: false, followersCount: prev.followersCount - 1 } : null);
      } else {
        await UserProfileService.followUser(parseInt(userId));
        setProfile(prev => prev ? { ...prev, isFollowing: true, followersCount: prev.followersCount + 1 } : null);
      }
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate(`/profile/${userId}/edit`);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">Profile not found.</Alert>
      </Container>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Profile Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
          {/* Avatar and Basic Info */}
          <Box sx={{ textAlign: 'center' }}>
            <Avatar
              src={profile.avatarUrl || undefined}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            >
              {profile.displayName?.charAt(0) || profile.fullName?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="h4" gutterBottom>
              {profile.displayName || profile.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              @{profile.username}
            </Typography>
            
            {/* Follow Button */}
            {!profile.isOwnProfile && (
              <Button
                variant={profile.isFollowing ? "outlined" : "contained"}
                startIcon={profile.isFollowing ? <FollowingIcon /> : <FollowIcon />}
                onClick={handleFollow}
                disabled={followLoading}
                sx={{ mt: 2 }}
              >
                {profile.isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
            
            {/* Edit Profile Button */}
            {profile.isOwnProfile && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEditProfile}
                sx={{ mt: 2 }}
              >
                Edit Profile
              </Button>
            )}
          </Box>

          {/* Profile Details */}
          <Box>
            {profile.bio && (
              <Typography variant="body1" sx={{ mb: 2 }}>
                {profile.bio}
              </Typography>
            )}

            {/* Contact Info */}
            <Box sx={{ mb: 2 }}>
              {profile.location && (
                <Chip
                  icon={<LocationIcon />}
                  label={profile.location}
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
              {profile.website && (
                <Chip
                  icon={<WebsiteIcon />}
                  label="Website"
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                  clickable
                  onClick={() => profile.website && window.open(profile.website, '_blank')}
                />
              )}
            </Box>

            {/* Social Links */}
            <Box sx={{ mb: 2 }}>
              {profile.twitterHandle && (
                <IconButton
                  onClick={() => window.open(`https://twitter.com/${profile.twitterHandle}`, '_blank')}
                  sx={{ mr: 1 }}
                >
                  <TwitterIcon />
                </IconButton>
              )}
              {profile.instagramHandle && (
                <IconButton
                  onClick={() => window.open(`https://instagram.com/${profile.instagramHandle}`, '_blank')}
                  sx={{ mr: 1 }}
                >
                  <InstagramIcon />
                </IconButton>
              )}
            </Box>

            {/* Member Since */}
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarIcon sx={{ mr: 1, fontSize: 16 }} />
              Member since {formatDate(profile.memberSince)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <BookIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{profile.booksRead}</Typography>
            <Typography variant="body2" color="text.secondary">Books Read</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <PersonIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{profile.followersCount}</Typography>
            <Typography variant="body2" color="text.secondary">Followers</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{profile.followingCount}</Typography>
            <Typography variant="body2" color="text.secondary">Following</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <ReviewIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{profile.reviewsCount}</Typography>
            <Typography variant="body2" color="text.secondary">Reviews</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs for different sections */}
      <Paper elevation={1}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Currently Reading" />
          <Tab label="Read Books" />
          <Tab label="Reviews" />
          <Tab label="Followers" />
          <Tab label="Following" />
        </Tabs>
        <Divider />
        
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Typography variant="body1" color="text.secondary">
              Currently reading: {profile.currentlyReading} books
            </Typography>
          )}
          {activeTab === 1 && (
            <Typography variant="body1" color="text.secondary">
              Read: {profile.booksRead} books
            </Typography>
          )}
          {activeTab === 2 && (
            <Typography variant="body1" color="text.secondary">
              Reviews: {profile.reviewsCount} reviews
            </Typography>
          )}
          {activeTab === 3 && (
            <Typography variant="body1" color="text.secondary">
              Followers: {profile.followersCount} followers
            </Typography>
          )}
          {activeTab === 4 && (
            <Typography variant="body1" color="text.secondary">
              Following: {profile.followingCount} users
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
