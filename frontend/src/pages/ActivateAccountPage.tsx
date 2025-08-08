import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticationService } from '../app/services/services/AuthenticationService';

const ActivateAccountPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    setError(null);

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
    <div className="min-h-screen bg-vintage-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-playfair font-bold text-amber-900">
            Activate Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-amber-700">
            Enter the activation code sent to your email
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              Account activated successfully! Redirecting to login...
            </p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-amber-900 mb-1">
              Activation Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-amber-300 placeholder-amber-500 text-amber-900 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:z-10 transition-all duration-200"
              placeholder="Enter your activation code"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !code}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Activating...
                </div>
              ) : (
                'Activate Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivateAccountPage;