import React, { useState, useEffect } from 'react';
import { 
  getCurrentUser, 
  signInWithGoogle, 
  signInWithFacebook, 
  connectSpotify, 
  connectFacebookMarketplace,
  connectShopify,
  connectEbay,
  connectAmazon,
  connectEtsy,
  connectPlatformGeneric,
  signOutUser, 
  onAuthStateChange, 
  updateUserPreferences,
  connectPlatform,
  disconnectPlatform,
  UserProfile 
} from '../services/authService';
import Spinner from './Spinner';

interface UserAuthProps {
  onAuthChange?: (user: UserProfile | null) => void;
}

export const UserAuth: React.FC<UserAuthProps> = ({ onAuthChange }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
      onAuthChange?.(newUser);
    });

    // Initialize with current user
    setUser(getCurrentUser());

    return unsubscribe;
  }, [onAuthChange]);

  const handleSignIn = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError(null);
    
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else if (provider === 'facebook') {
        await signInWithFacebook();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOutUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSpotify = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await connectSpotify();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect Spotify');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectPlatform = async (platform: keyof UserProfile['connectedPlatforms']) => {
    setLoading(true);
    setError(null);
    
    try {
      switch (platform) {
        case 'facebookMarketplace':
          await connectFacebookMarketplace();
          break;
        case 'shopify':
          await connectShopify();
          break;
        case 'ebay':
          await connectEbay();
          break;
        case 'amazon':
          await connectAmazon();
          break;
        case 'etsy':
          await connectEtsy();
          break;
        case 'mercari':
        case 'poshmark':
        case 'depop':
        case 'vinted':
          await connectPlatformGeneric(platform);
          break;
        default:
          await connectPlatform(platform);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to connect ${platform}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlatform = async (platform: keyof UserProfile['connectedPlatforms']) => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (user.connectedPlatforms[platform]) {
        await disconnectPlatform(platform);
      } else {
        await connectPlatform(platform);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update platform connection');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async (preferences: Partial<UserProfile['preferences']>) => {
    setLoading(true);
    try {
      await updateUserPreferences(preferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Sign In to SwiftSell AI</h2>
        <p className="text-gray-600 mb-6 text-center">
          Connect your accounts to save your preferences and sync across platforms
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={() => handleSignIn('google')}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>
          
          <button
            onClick={() => handleSignIn('facebook')}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </>
            )}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <h3 className="font-semibold text-gray-800">{user.displayName || 'User'}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showSettings && (
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-semibold text-gray-800">Connected Platforms</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Google</span>
              <span className={`px-2 py-1 rounded text-xs ${
                user.connectedPlatforms.google ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {user.connectedPlatforms.google ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            
            {/* Social Platforms */}
            <div className="mb-4">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Social Platforms</h5>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Facebook</span>
                <button
                  onClick={() => handleTogglePlatform('facebook')}
                  disabled={loading}
                  className={`px-2 py-1 rounded text-xs ${
                    user.connectedPlatforms.facebook 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {user.connectedPlatforms.facebook ? 'Connected' : 'Connect'}
                </button>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Spotify</span>
                <button
                  onClick={user.connectedPlatforms.spotify ? () => handleTogglePlatform('spotify') : handleConnectSpotify}
                  disabled={loading}
                  className={`px-2 py-1 rounded text-xs ${
                    user.connectedPlatforms.spotify 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {user.connectedPlatforms.spotify ? 'Connected' : 'Connect'}
                </button>
              </div>
            </div>

            {/* Selling Platforms */}
            <div className="mb-4">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Selling Platforms</h5>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Facebook Marketplace</span>
                <button
                  onClick={user.connectedPlatforms.facebookMarketplace ? () => handleTogglePlatform('facebookMarketplace') : () => handleConnectPlatform('facebookMarketplace')}
                  disabled={loading}
                  className={`px-2 py-1 rounded text-xs ${
                    user.connectedPlatforms.facebookMarketplace 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  {user.connectedPlatforms.facebookMarketplace ? 'Connected' : 'Connect'}
                </button>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Shopify</span>
                <button
                  onClick={user.connectedPlatforms.shopify ? () => handleTogglePlatform('shopify') : () => handleConnectPlatform('shopify')}
                  disabled={loading}
                  className={`px-2 py-1 rounded text-xs ${
                    user.connectedPlatforms.shopify 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  {user.connectedPlatforms.shopify ? 'Connected' : 'Connect'}
                </button>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">eBay</span>
                <button
                  onClick={user.connectedPlatforms.ebay ? () => handleTogglePlatform('ebay') : () => handleConnectPlatform('ebay')}
                  disabled={loading}
                  className={`px-2 py-1 rounded text-xs ${
                    user.connectedPlatforms.ebay 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  {user.connectedPlatforms.ebay ? 'Connected' : 'Connect'}
                </button>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Amazon</span>
                <button
                  onClick={user.connectedPlatforms.amazon ? () => handleTogglePlatform('amazon') : () => handleConnectPlatform('amazon')}
                  disabled={loading}
                  className={`px-2 py-1 rounded text-xs ${
                    user.connectedPlatforms.amazon 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  {user.connectedPlatforms.amazon ? 'Connected' : 'Connect'}
                </button>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Etsy</span>
                <button
                  onClick={user.connectedPlatforms.etsy ? () => handleTogglePlatform('etsy') : () => handleConnectPlatform('etsy')}
                  disabled={loading}
                  className={`px-2 py-1 rounded text-xs ${
                    user.connectedPlatforms.etsy 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  {user.connectedPlatforms.etsy ? 'Connected' : 'Connect'}
                </button>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Mercari</span>
                <button
                  onClick={user.connectedPlatforms.mercari ? () => handleTogglePlatform('mercari') : () => handleConnectPlatform('mercari')}
                  disabled={loading}
                  className={`px-2 py-1 rounded text-xs ${
                    user.connectedPlatforms.mercari 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  {user.connectedPlatforms.mercari ? 'Connected' : 'Connect'}
                </button>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Poshmark</span>
                <button
                  onClick={user.connectedPlatforms.poshmark ? () => handleTogglePlatform('poshmark') : () => handleConnectPlatform('poshmark')}
                  disabled={loading}
                  className={`px-2 py-1 rounded text-xs ${
                    user.connectedPlatforms.poshmark 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  {user.connectedPlatforms.poshmark ? 'Connected' : 'Connect'}
                </button>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Depop</span>
                <button
                  onClick={user.connectedPlatforms.depop ? () => handleTogglePlatform('depop') : () => handleConnectPlatform('depop')}
                  disabled={loading}
                  className={`px-2 py-1 rounded text-xs ${
                    user.connectedPlatforms.depop 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  {user.connectedPlatforms.depop ? 'Connected' : 'Connect'}
                </button>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Vinted</span>
                <button
                  onClick={user.connectedPlatforms.vinted ? () => handleTogglePlatform('vinted') : () => handleConnectPlatform('vinted')}
                  disabled={loading}
                  className={`px-2 py-1 rounded text-xs ${
                    user.connectedPlatforms.vinted 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  {user.connectedPlatforms.vinted ? 'Connected' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-2">Preferences</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auto Sync</span>
                <button
                  onClick={() => handleUpdatePreferences({ autoSync: !user.preferences.autoSync })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    user.preferences.autoSync ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    user.preferences.autoSync ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Notifications</span>
                <button
                  onClick={() => handleUpdatePreferences({ notifications: !user.preferences.notifications })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    user.preferences.notifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    user.preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? <Spinner size="sm" /> : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};