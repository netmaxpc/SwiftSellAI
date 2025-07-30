import React, { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import Spinner from './Spinner';

interface ApiKeys {
  geminiApiKey: string;
  googleClientId: string;
  facebookAppId: string;
  spotifyClientId: string;
  shopifyApiKey: string;
  ebayClientId: string;
  amazonClientId: string;
  etsyClientId: string;
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
}

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    geminiApiKey: '',
    googleClientId: '',
    facebookAppId: '',
    spotifyClientId: '',
    shopifyApiKey: '',
    ebayClientId: '',
    amazonClientId: '',
    etsyClientId: '',
    firebaseApiKey: '',
    firebaseAuthDomain: '',
    firebaseProjectId: '',
    firebaseStorageBucket: '',
    firebaseMessagingSenderId: '',
    firebaseAppId: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Admin authentication
  const ADMIN_PASSWORD = 'SwiftSellAdmin2024'; // Change this to your preferred password

  useEffect(() => {
    if (isAuthenticated) {
      loadApiKeys();
    }
  }, [isAuthenticated]);

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setMessage(null);
    } else {
      setMessage({ type: 'error', text: 'Invalid admin password' });
    }
  };

  const loadApiKeys = async () => {
    setLoading(true);
    try {
      const keys = await Preferences.get({ key: 'admin_api_keys' });
      if (keys.value) {
        setApiKeys(JSON.parse(keys.value));
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
      setMessage({ type: 'error', text: 'Failed to load API keys' });
    } finally {
      setLoading(false);
    }
  };

  const saveApiKeys = async () => {
    setSaving(true);
    try {
      await Preferences.set({
        key: 'admin_api_keys',
        value: JSON.stringify(apiKeys)
      });
      setMessage({ type: 'success', text: 'API keys saved successfully!' });
      
      // Also update environment variables for immediate use
      updateEnvironmentVariables();
      
    } catch (error) {
      console.error('Failed to save API keys:', error);
      setMessage({ type: 'error', text: 'Failed to save API keys' });
    } finally {
      setSaving(false);
    }
  };

  const updateEnvironmentVariables = () => {
    // Update process.env for immediate use (note: this only works in development)
    if (typeof window !== 'undefined') {
      (window as any).ENV_VARS = {
        GEMINI_API_KEY: apiKeys.geminiApiKey,
        GOOGLE_CLIENT_ID: apiKeys.googleClientId,
        FACEBOOK_APP_ID: apiKeys.facebookAppId,
        SPOTIFY_CLIENT_ID: apiKeys.spotifyClientId,
        SHOPIFY_API_KEY: apiKeys.shopifyApiKey,
        EBAY_CLIENT_ID: apiKeys.ebayClientId,
        AMAZON_CLIENT_ID: apiKeys.amazonClientId,
        ETSY_CLIENT_ID: apiKeys.etsyClientId,
        FIREBASE_API_KEY: apiKeys.firebaseApiKey,
        FIREBASE_AUTH_DOMAIN: apiKeys.firebaseAuthDomain,
        FIREBASE_PROJECT_ID: apiKeys.firebaseProjectId,
        FIREBASE_STORAGE_BUCKET: apiKeys.firebaseStorageBucket,
        FIREBASE_MESSAGING_SENDER_ID: apiKeys.firebaseMessagingSenderId,
        FIREBASE_APP_ID: apiKeys.firebaseAppId
      };
    }
  };

  const handleInputChange = (key: keyof ApiKeys, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    if (message) {
      clearMessage();
    }
  }, [message]);

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Admin Access</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter admin password"
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
            </div>
            
            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {message.text}
              </div>
            )}
            
            <button
              onClick={handleAdminLogin}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Panel - API Key Management</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="h-8 w-8" />
          </div>
        ) : (
          <div className="space-y-6">
            {message && (
              <div className={`p-4 rounded-md text-sm ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {message.text}
              </div>
            )}

            {/* AI & Core Services */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">AI & Core Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeys.geminiApiKey}
                    onChange={(e) => handleInputChange('geminiApiKey', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter Gemini API key"
                  />
                </div>
              </div>
            </div>

            {/* Authentication Services */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Authentication Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Client ID
                  </label>
                  <input
                    type="text"
                    value={apiKeys.googleClientId}
                    onChange={(e) => handleInputChange('googleClientId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter Google Client ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook App ID
                  </label>
                  <input
                    type="text"
                    value={apiKeys.facebookAppId}
                    onChange={(e) => handleInputChange('facebookAppId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter Facebook App ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spotify Client ID
                  </label>
                  <input
                    type="text"
                    value={apiKeys.spotifyClientId}
                    onChange={(e) => handleInputChange('spotifyClientId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter Spotify Client ID"
                  />
                </div>
              </div>
            </div>

            {/* Selling Platforms */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Selling Platforms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shopify API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeys.shopifyApiKey}
                    onChange={(e) => handleInputChange('shopifyApiKey', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter Shopify API Key"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    eBay Client ID
                  </label>
                  <input
                    type="text"
                    value={apiKeys.ebayClientId}
                    onChange={(e) => handleInputChange('ebayClientId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter eBay Client ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amazon Client ID
                  </label>
                  <input
                    type="text"
                    value={apiKeys.amazonClientId}
                    onChange={(e) => handleInputChange('amazonClientId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter Amazon Client ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Etsy Client ID
                  </label>
                  <input
                    type="text"
                    value={apiKeys.etsyClientId}
                    onChange={(e) => handleInputChange('etsyClientId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter Etsy Client ID"
                  />
                </div>
              </div>
            </div>

            {/* Firebase Configuration */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Firebase Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Firebase API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeys.firebaseApiKey}
                    onChange={(e) => handleInputChange('firebaseApiKey', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter Firebase API Key"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Firebase Auth Domain
                  </label>
                  <input
                    type="text"
                    value={apiKeys.firebaseAuthDomain}
                    onChange={(e) => handleInputChange('firebaseAuthDomain', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="your-project.firebaseapp.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Firebase Project ID
                  </label>
                  <input
                    type="text"
                    value={apiKeys.firebaseProjectId}
                    onChange={(e) => handleInputChange('firebaseProjectId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="your-project-id"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Firebase Storage Bucket
                  </label>
                  <input
                    type="text"
                    value={apiKeys.firebaseStorageBucket}
                    onChange={(e) => handleInputChange('firebaseStorageBucket', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="your-project.appspot.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Firebase Messaging Sender ID
                  </label>
                  <input
                    type="text"
                    value={apiKeys.firebaseMessagingSenderId}
                    onChange={(e) => handleInputChange('firebaseMessagingSenderId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Firebase App ID
                  </label>
                  <input
                    type="text"
                    value={apiKeys.firebaseAppId}
                    onChange={(e) => handleInputChange('firebaseAppId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="1:123456789:web:abcdef123456"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveApiKeys}
                disabled={saving}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {saving && <Spinner size="h-4 w-4" />}
                <span>{saving ? 'Saving...' : 'Save API Keys'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};