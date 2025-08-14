import React from 'react';
import { Building, Users, MapPin, Calendar, DollarSign, FileText, Clock, CreditCard, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ExampleQueries = ({ exampleQueries, handleExampleClick }) => {
  const { theme } = useTheme();
  
  // Icons for different query categories
  const icons = [
    Building, Users, MapPin, Calendar, DollarSign, FileText, Clock, CreditCard, Shield
  ];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {exampleQueries.slice(0, 6).map((example, index) => {
        const IconComponent = icons[index % icons.length];
        
        return (
          <button
            key={index}
            onClick={() => handleExampleClick(example)}
            className={`flex items-center p-3.5 text-left rounded-lg hover-lift group
              border transition-all duration-200
              ${theme === 'dark' 
                ? 'bg-dark-surface border-dark-border hover:border-gems-orange' 
                : 'bg-white border-gray-200 hover:border-gems-orange'}
              relative overflow-hidden`}
            aria-label={`Search for ${example}`}
          >
            {/* Background gradient that appears on hover */}
            <div className={`absolute inset-0 bg-orange-gradient-subtle opacity-0 
              group-hover:opacity-100 transition-opacity`}></div>
            
            <div className={`absolute bottom-0 left-0 h-0.5 w-full transform scale-x-0 
              bg-gems-orange group-hover:scale-x-100 transition-transform origin-left duration-300`}></div>
            
            <IconComponent className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors
              ${theme === 'dark' 
                ? 'text-dark-text-secondary group-hover:text-gems-orange' 
                : 'text-gray-500 group-hover:text-gems-orange'}`} />
              
            <span className={`text-sm transition-colors relative z-10
              ${theme === 'dark' 
                ? 'text-dark-text group-hover:text-dark-text' 
                : 'text-gray-700 group-hover:text-gray-900'}`}>
              {example}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ExampleQueries;
