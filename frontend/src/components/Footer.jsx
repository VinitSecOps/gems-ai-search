import React from 'react';
import { Database, Code, Zap, Heart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  
  return (
    <footer className={`mt-12 py-6 border-t ${theme === 'dark' ? 'border-dark-border' : 'border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-2">
          <div className="flex items-center mb-4 sm:mb-0">
            <Database className={`h-5 w-5 ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'} mr-2`} />
            <span className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}`}>
              GEMS AI Search • Powered by AI and SQL Server
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Code className={`h-4 w-4 ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'} mr-1`} />
              <span className={`text-xs ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}`}>
                NLP to SQL Processing
              </span>
            </div>
            
            <div className="flex items-center">
              <Zap className={`h-4 w-4 ${theme === 'dark' ? 'text-gems-orange' : 'text-gems-orange'} mr-1`} />
              <span className={`text-xs ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}`}>
                Enhanced with OpenAI GPT
              </span>
            </div>
          </div>
        </div>
        
        {/* Developer attribution */}
        <div className="flex justify-center items-center pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center">
            <Heart className={`h-3 w-3 text-gems-orange mr-1`} />
            <span className={`text-xs ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}`}>
              Developed by Matriks Ltd
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
