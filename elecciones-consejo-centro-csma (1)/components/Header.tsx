
import React from 'react';

interface HeaderProps {
  onHomeClick: () => void;
  showHomeButton: boolean;
}

export default function Header({ onHomeClick, showHomeButton }: HeaderProps): React.ReactElement {
  return (
    <header className="w-full max-w-6xl mx-auto mb-8 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-600 rounded-lg">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
          Elecciones Consejo CSMA
        </h1>
      </div>
      {showHomeButton && (
        <button
          onClick={onHomeClick}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
        >
          Inicio
        </button>
      )}
    </header>
  );
}