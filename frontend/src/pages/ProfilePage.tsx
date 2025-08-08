import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IoCreate,
  IoLocationOutline,
  IoLinkOutline,
  IoBook,
  IoStar,
  IoTrendingUp
} from 'react-icons/io5';
import { UserProfileService, UserProfileResponse } from '../app/services/services/UserProfileService';
import { tokenService } from '../services/tokenService';

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const currentUser = tokenService.getUser();
    const targetUserId = userId || currentUser?.id?.toString();
    
    if (targetUserId) {
      setIsOwnProfile(currentUser?.id?.toString() === targetUserId);
      loadProfile(parseInt(targetUserId));
    }
  }, [userId]);

  const loadProfile = async (id: number) => {
    try {
      setLoading(true);
      // TODO: Implement profile loading when API is ready
      // For now, create a mock profile based on current user
      const currentUser = tokenService.getUser();
      setProfile({
        userId: id,
        username: currentUser?.name || 'user',
        email: currentUser?.email || 'user@example.com',
        fullName: currentUser?.name || 'User',
        displayName: currentUser?.name || 'User',
        bio: null,
        location: null,
        website: null,
        avatarUrl: null,
        twitterHandle: null,
        instagramHandle: null,
        goodreadsHandle: null,
        annualReadingGoal: null,
        preferredFormat: null,
        readingSpeed: null,
        profileVisibility: 'PUBLIC',
        activityVisibility: 'PUBLIC',
        reviewsVisibility: 'PUBLIC',
        booksRead: 0,
        currentlyReading: 0,
        wantToRead: null,
        averageRating: null,
        reviewsCount: 0,
        followersCount: 0,
        followingCount: 0,
        memberSince: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isFollowing: false,
        isFollowedBy: false,
        isOwnProfile: true
      });
    } catch (err: any) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-vintage-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-vintage-cream p-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error || 'Profile not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { label: 'Currently Reading', count: 0 },
    { label: 'Read Books', count: 0 },
    { label: 'Reviews', count: 0 },
    { label: 'Activity', count: 0 }
  ];

  return (
    <div className="min-h-screen bg-vintage-cream">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-amber-800 to-orange-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            
            {/* Profile Avatar */}
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
              {profile.displayName?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase() || 'U'}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="font-playfair text-3xl font-bold">
                  {profile.displayName || profile.email || 'User'}
                </h1>
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/edit-profile')}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <IoCreate className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>

              {profile.bio && (
                <p className="text-white/90 mb-4 max-w-2xl">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-white/80">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <IoLocationOutline className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-1">
                    <IoLinkOutline className="w-4 h-4" />
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}
                {profile.annualReadingGoal && (
                  <div className="flex items-center gap-1">
                    <IoTrendingUp className="w-4 h-4" />
                    Goal: {profile.annualReadingGoal} books/year
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Reading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl shadow-lg shadow-amber-900/10 p-6 text-center">
            <IoBook className="text-orange-600 text-3xl mx-auto mb-2" />
            <h3 className="font-playfair text-2xl font-bold text-amber-900 mb-1">0</h3>
            <p className="text-amber-700">Books Read</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl shadow-lg shadow-amber-900/10 p-6 text-center">
            <IoStar className="text-yellow-500 text-3xl mx-auto mb-2" />
            <h3 className="font-playfair text-2xl font-bold text-amber-900 mb-1">0</h3>
            <p className="text-amber-700">Reviews Written</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl shadow-lg shadow-amber-900/10 p-6 text-center">
            <IoTrendingUp className="text-green-600 text-3xl mx-auto mb-2" />
            <h3 className="font-playfair text-2xl font-bold text-amber-900 mb-1">
              {profile.annualReadingGoal || 0}
            </h3>
            <p className="text-amber-700">Reading Goal</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl shadow-lg shadow-amber-900/10 overflow-hidden">
          
          {/* Tab Headers */}
          <div className="border-b border-amber-200 bg-amber-50/50">
            <div className="flex">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                    activeTab === index
                      ? 'text-orange-600 border-b-2 border-orange-600 bg-white'
                      : 'text-amber-700 hover:text-orange-600'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 px-2 py-1 bg-amber-200 text-amber-800 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 0 && (
              <div className="text-center py-12">
                <IoBook className="text-amber-400 text-5xl mx-auto mb-4" />
                <h3 className="font-playfair text-xl font-semibold text-amber-900 mb-2">
                  No Books Currently Reading
                </h3>
                <p className="text-amber-700">
                  {isOwnProfile ? 'Start reading some books!' : 'This user is not currently reading any books.'}
                </p>
              </div>
            )}
            
            {activeTab === 1 && (
              <div className="text-center py-12">
                <IoBook className="text-amber-400 text-5xl mx-auto mb-4" />
                <h3 className="font-playfair text-xl font-semibold text-amber-900 mb-2">
                  No Books Read Yet
                </h3>
                <p className="text-amber-700">
                  {isOwnProfile ? 'Complete some books to see them here!' : 'This user hasn\'t finished any books yet.'}
                </p>
              </div>
            )}
            
            {activeTab === 2 && (
              <div className="text-center py-12">
                <IoStar className="text-amber-400 text-5xl mx-auto mb-4" />
                <h3 className="font-playfair text-xl font-semibold text-amber-900 mb-2">
                  No Reviews Yet
                </h3>
                <p className="text-amber-700">
                  {isOwnProfile ? 'Write some book reviews!' : 'This user hasn\'t written any reviews yet.'}
                </p>
              </div>
            )}
            
            {activeTab === 3 && (
              <div className="text-center py-12">
                <IoTrendingUp className="text-amber-400 text-5xl mx-auto mb-4" />
                <h3 className="font-playfair text-xl font-semibold text-amber-900 mb-2">
                  No Activity Yet
                </h3>
                <p className="text-amber-700">
                  {isOwnProfile ? 'Start interacting with books!' : 'This user hasn\'t been active yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;