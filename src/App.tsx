
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, ItemData, GroundingChunk } from './types';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import PlatformSelector from './components/PlatformSelector';
import Assistant from './components/Assistant';
import { UserAuth } from './components/UserAuth';
import { AdminPanel } from './components/AdminPanel';
import { analyzeImages } from './services/geminiService';
import { initializeAuth, UserProfile } from './services/authService';

const CheckCircleIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [itemData, setItemData] = useState<ItemData | null>(null);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [listedPlatforms, setListedPlatforms] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Initialize authentication on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const handleAuthChange = useCallback((newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser) {
      setShowAuth(false);
    }
  }, []);

  const handleToggleAdmin = useCallback(() => {
    setShowAdmin(!showAdmin);
  }, [showAdmin]);

  const handleAnalyze = useCallback(async (images: File[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const { itemData: data, sources: priceSources } = await analyzeImages(images);
      setItemData(data);
      setSources(priceSources);
      setAppState(AppState.REVIEW);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during analysis.";
      setError(`Failed to analyze images. ${errorMessage}`);
      setAppState(AppState.IDLE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleApprove = useCallback((updatedData: ItemData) => {
    setItemData(updatedData);
    setAppState(AppState.LISTING);
  }, []);

  const handleList = useCallback((platforms: string[]) => {
    setIsLoading(true);
    setError(null);
    setListedPlatforms(platforms);

    setTimeout(() => {
      setAppState(AppState.COMPLETE);
      setIsLoading(false);
    }, 2000);
  }, []);

  const handleReset = useCallback(() => {
    setAppState(AppState.IDLE);
    setItemData(null);
    setSources([]);
    setError(null);
    setListedPlatforms([]);
    setIsLoading(false);
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.IDLE:
        return (
          <div className="fade-in">
            <ImageUploader onAnalyze={handleAnalyze} isAnalyzing={isLoading} />
          </div>
        );
      case AppState.REVIEW:
        if (itemData) {
          return (
            <div className="fade-in">
              <ResultDisplay initialData={itemData} sources={sources} onApprove={handleApprove} />
            </div>
          );
        }
        return null;
      case AppState.LISTING:
        return (
          <div className="fade-in">
            <PlatformSelector onList={handleList} isListing={isLoading} />
          </div>
        );
      case AppState.COMPLETE:
        return (
          <div className="fade-in">
            <div className="w-full max-w-2xl mx-auto p-8 text-center bg-gray-800 rounded-lg shadow-lg border border-green-500">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Listing Successful!</h2>
              <p className="text-gray-300 mb-4">Your item has been posted to: {listedPlatforms.join(', ')}.</p>
              <button
                onClick={handleReset}
                className="mt-4 bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors"
              >
                List Another Item
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header user={user} onToggleAuth={() => setShowAuth(!showAuth)} onToggleAdmin={handleToggleAdmin} />
      
      {/* Authentication Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 z-10"
            >
              ×
            </button>
            <UserAuth onAuthChange={handleAuthChange} />
          </div>
        </div>
      )}
      
      {/* Admin Panel Modal */}
      {showAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-auto">
            <button
              onClick={() => setShowAdmin(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 z-10"
            >
              ×
            </button>
            <AdminPanel />
          </div>
        </div>
      )}
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
        <div className="w-full">
            {error && (
            <div className="w-full max-w-2xl mx-auto p-4 mb-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg">
                <p><strong>Error:</strong> {error}</p>
            </div>
            )}
            {renderContent()}
        </div>
      </main>
      <Assistant />
    </div>
  );
};

export default App;
