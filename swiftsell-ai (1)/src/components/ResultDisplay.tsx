
import React, { useState, useEffect } from 'react';
import { ItemData, GroundingChunk } from '../types';

interface ResultDisplayProps {
  initialData: ItemData;
  sources: GroundingChunk[];
  onApprove: (updatedData: ItemData) => void;
}

const LinkIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path>
  </svg>
);


const ResultDisplay: React.FC<ResultDisplayProps> = ({ initialData, sources, onApprove }) => {
  const [itemData, setItemData] = useState<ItemData>(initialData);

  useEffect(() => {
    setItemData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setItemData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-center mb-6">Review Your Listing</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={itemData.title}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            rows={8}
            value={itemData.description}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
          />
        </div>
        
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">Suggested Price (USD)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">$</span>
            <input
              type="number"
              id="price"
              name="price"
              value={itemData.price}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md pl-7 pr-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
            />
          </div>
        </div>

        {sources.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <LinkIcon className="w-4 h-4 mr-2" />
              Pricing Sources
            </h3>
            <div className="bg-gray-900/50 p-3 rounded-md space-y-2 max-h-32 overflow-y-auto">
              {sources.map((source, index) => source.web && source.web.uri && (
                <a key={index} href={source.web.uri} target="_blank" rel="noopener noreferrer" className="block text-xs text-red-400 hover:text-red-300 truncate" title={source.web.title}>
                  {source.web.title || source.web.uri}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => onApprove(itemData)}
        className="w-full mt-8 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
      >
        Approve & Select Platforms
      </button>
    </div>
  );
};

export default ResultDisplay;