
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold tracking-tight">
            Swift<span className="text-red-500">Sell</span> AI
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
