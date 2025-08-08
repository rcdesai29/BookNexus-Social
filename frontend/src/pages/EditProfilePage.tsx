import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSave, IoClose } from 'react-icons/io5';
import { UserProfileService, UserProfileRequest } from '../app/services/services/UserProfileService';
import { tokenService } from '../services/tokenService';

type LocalUserProfileRequest = UserProfileRequest;

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<LocalUserProfileRequest>({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    twitterHandle: '',
    instagramHandle: '',
    goodreadsHandle: '',
    annualReadingGoal: undefined,
    preferredFormat: '',
    readingSpeed: '',
    profileVisibility: 'PUBLIC',
    activityVisibility: 'PUBLIC',
    reviewsVisibility: 'PUBLIC'
  });

  useEffect(() => {
    loadCurrentProfile();
  }, []);

  const loadCurrentProfile = async () => {
    try {
      setLoading(true);
      // TODO: Load current user profile if endpoint exists
      // const profile = await UserProfileService.getCurrentProfile();
      // setFormData(profile);
    } catch (err: any) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LocalUserProfileRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const currentUser = tokenService.getUser();
      await UserProfileService.updateUserProfile(currentUser?.id || 1, formData);
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.displayName) {
    return (
      <div className="min-h-screen bg-vintage-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vintage-cream py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-playfair text-4xl font-bold text-amber-900 mb-2">
            Edit Profile
          </h1>
          <p className="text-amber-700">Update your profile information</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">Profile updated successfully! Redirecting...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Information */}
          <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl shadow-lg shadow-amber-900/10 p-8">
            <h2 className="font-playfair text-2xl font-semibold text-amber-900 mb-6">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-amber-900 mb-1">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="How others will see your name"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-amber-900 mb-1">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="bio" className="block text-sm font-medium text-amber-900 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                maxLength={500}
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Tell others about yourself (max 500 characters)"
              />
              <p className="text-xs text-amber-600 mt-1">
                {formData.bio?.length || 0}/500 characters
              </p>
            </div>

            <div className="mt-6">
              <label htmlFor="website" className="block text-sm font-medium text-amber-900 mb-1">
                Website
              </label>
              <input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="Your personal website or blog"
              />
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl shadow-lg shadow-amber-900/10 p-8">
            <h2 className="font-playfair text-2xl font-semibold text-amber-900 mb-6">
              Social Media
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="twitterHandle" className="block text-sm font-medium text-amber-900 mb-1">
                  Twitter Handle
                </label>
                <input
                  id="twitterHandle"
                  type="text"
                  value={formData.twitterHandle}
                  onChange={(e) => handleInputChange('twitterHandle', e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="@username"
                />
              </div>

              <div>
                <label htmlFor="instagramHandle" className="block text-sm font-medium text-amber-900 mb-1">
                  Instagram Handle
                </label>
                <input
                  id="instagramHandle"
                  type="text"
                  value={formData.instagramHandle}
                  onChange={(e) => handleInputChange('instagramHandle', e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="@username"
                />
              </div>

              <div>
                <label htmlFor="goodreadsHandle" className="block text-sm font-medium text-amber-900 mb-1">
                  Goodreads Handle
                </label>
                <input
                  id="goodreadsHandle"
                  type="text"
                  value={formData.goodreadsHandle}
                  onChange={(e) => handleInputChange('goodreadsHandle', e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="Goodreads username"
                />
              </div>
            </div>
          </div>

          {/* Reading Preferences */}
          <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl shadow-lg shadow-amber-900/10 p-8">
            <h2 className="font-playfair text-2xl font-semibold text-amber-900 mb-6">
              Reading Preferences
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="annualReadingGoal" className="block text-sm font-medium text-amber-900 mb-1">
                  Annual Reading Goal
                </label>
                <input
                  id="annualReadingGoal"
                  type="number"
                  min="0"
                  value={formData.annualReadingGoal || ''}
                  onChange={(e) => handleInputChange('annualReadingGoal', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="Number of books per year"
                />
              </div>

              <div>
                <label htmlFor="preferredFormat" className="block text-sm font-medium text-amber-900 mb-1">
                  Preferred Format
                </label>
                <select
                  id="preferredFormat"
                  value={formData.preferredFormat}
                  onChange={(e) => handleInputChange('preferredFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">None</option>
                  <option value="PHYSICAL">Physical Books</option>
                  <option value="EBOOK">E-books</option>
                  <option value="AUDIOBOOK">Audiobooks</option>
                </select>
              </div>

              <div>
                <label htmlFor="readingSpeed" className="block text-sm font-medium text-amber-900 mb-1">
                  Reading Speed
                </label>
                <select
                  id="readingSpeed"
                  value={formData.readingSpeed}
                  onChange={(e) => handleInputChange('readingSpeed', e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">None</option>
                  <option value="FAST">Fast Reader</option>
                  <option value="AVERAGE">Average Reader</option>
                  <option value="SLOW">Slow Reader</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-white border border-amber-300 text-amber-800 font-medium py-3 px-6 rounded-lg hover:bg-amber-50 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <IoClose className="w-5 h-5" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-medium py-3 px-6 rounded-lg hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              <IoSave className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;