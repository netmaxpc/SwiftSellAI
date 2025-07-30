
import React, { useState } from 'react';
import { PLATFORMS } from '../constants';
import { Platform } from '../types';
import Spinner from './Spinner';

interface PlatformSelectorProps {
  onList: (platforms: string[]) => void;
  isListing: boolean;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ onList, isListing }) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(['shopify']));
  const [connections, setConnections] = useState<Record<string, boolean>>({'shopify': false});

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleConnect = (e: React.MouseEvent, platformId: string) => {
    e.stopPropagation();
    // Simulate API call for connection
    setConnections(prev => ({ ...prev, [platformId]: true }));
  }

  const handleListItems = () => {
    const enabledPlatforms = Array.from(selectedPlatforms).filter(id => {
        const platform = PLATFORMS.find(p => p.id === id);
        return !platform?.requiresConnection || connections[id];
    });
    if (enabledPlatforms.length > 0) {
      onList(enabledPlatforms);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-center mb-2">Where to sell?</h2>
      <p className="text-gray-400 text-center mb-6">Select the platforms you want to list on.</p>
      
      <div className="space-y-4">
        {PLATFORMS.map((platform: Platform) => {
          const isSelected = selectedPlatforms.has(platform.id);
          const isConnected = !platform.requiresConnection || connections[platform.id];
          return (
            <div
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              className={`p-4 rounded-lg border-2 flex items-center cursor-pointer transition-all duration-200 ${
                isSelected ? 'bg-red-900/50 border-red-500' : 'bg-gray-700 border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className={`w-10 h-10 mr-4 flex-shrink-0 flex items-center justify-center ${platform.id === 'ebay' ? '' : 'p-1'}`}>{React.cloneElement(platform.logo, { className: 'w-full h-auto' })}</div>
              <div className="flex-grow">
                <p className="font-semibold text-white">{platform.name}</p>
                {platform.requiresConnection && (
                  <p className={`text-xs ${isConnected ? 'text-green-400' : 'text-yellow-400'}`}>
                    {isConnected ? 'Connected' : 'Connection required'}
                  </p>
                )}
              </div>
              {platform.requiresConnection && !isConnected && (
                 <button onClick={(e) => handleConnect(e, platform.id)} className="bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-md hover:bg-blue-700 transition-colors ml-4 whitespace-nowrap">Connect</button>
              )}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4 flex-shrink-0 ${isSelected ? 'bg-red-500 border-red-400' : 'border-gray-400'}`}>
                {isSelected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleListItems}
        disabled={isListing || selectedPlatforms.size === 0}
        className="w-full mt-8 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {isListing ? (
          <>
            <Spinner size="h-6 w-6" />
            <span className="ml-3">Listing Item...</span>
          </>
        ) : (
          `List on ${selectedPlatforms.size} Platform${selectedPlatforms.size !== 1 ? 's' : ''}`
        )}
      </button>
    </div>
  );
};

export default PlatformSelector;
