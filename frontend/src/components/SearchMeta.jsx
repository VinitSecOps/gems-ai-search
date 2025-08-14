import React from 'react';
import { Clock, Database } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SearchMeta = ({ meta }) => {
  const { theme } = useTheme();
  
  if (!meta) return null;

  return (
    <div className={`rounded-lg p-4 mb-6 border flex items-center justify-between transition-all
      ${theme === 'dark' ? 'bg-dark-surface border-dark-border' : 'bg-light-surface border-light-border'}
      animate-slide-in`}
    >
      <div className="flex items-center">
        <Database className={`h-4 w-4 mr-2 ${theme === 'dark' ? 'text-gems-orange' : 'text-gems-orange'}`} />
        <span className={`text-sm ${theme === 'dark' ? 'text-dark-text' : 'text-blue-800'}`}>
          Found {meta.count} results
        </span>
      </div>
      
      <div className="flex items-center">
        <Clock className={`h-4 w-4 mr-2 ${theme === 'dark' ? 'text-gems-orange' : 'text-gems-orange'}`} />
        <span className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-blue-600'}`}>
          {meta.duration}ms • {new Date(meta.timestamp).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default SearchMeta;
