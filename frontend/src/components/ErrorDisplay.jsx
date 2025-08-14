import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ErrorDisplay = ({ error }) => {
  const { theme } = useTheme();
  
  if (!error) return null;

  // Parse error message to split into main error and details/suggestions
  const errorLines = error.split('\n');
  const mainError = errorLines[0];
  const details = errorLines.slice(1).join('\n');

  return (
    <div className={`rounded-lg p-4 mb-6 border transition-all overflow-hidden
      ${theme === 'dark' ? 'bg-dark-surface border-red-900' : 'bg-red-50 border-red-200'}
      animate-slide-in`}
    >
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className={`font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
            {mainError}
          </span>
          {details && (
            <pre className={`mt-1 whitespace-pre-wrap font-sans text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
              {details}
            </pre>
          )}
        </div>
      </div>

      {/* Orange pulsing border effect to draw attention */}
      <div className="animate-pulse mt-4 h-0.5 bg-gradient-to-r from-transparent via-gems-orange to-transparent rounded-full"></div>
    </div>
  );
};

export default ErrorDisplay;
