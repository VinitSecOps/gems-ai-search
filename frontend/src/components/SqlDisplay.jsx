import React, { useState, useEffect } from 'react';
import { CheckCircle, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// SQL syntax highlighting function
const highlightSql = (sql) => {
  if (!sql) return '';
  
  // If SQL contains HTML, it's probably already highlighted - return it plain
  if (sql.includes('<span class=')) {
    return sql.replace(/<[^>]*>/g, ''); // Strip HTML tags
  }
  
  // SQL keywords for highlighting
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
    'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'UPDATE', 'DELETE',
    'CREATE', 'ALTER', 'DROP', 'AS', 'ON', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL',
    'NOT', 'DISTINCT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC', 'TOP'
  ];
  
  // Functions
  const functions = [
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'ISNULL', 'CONVERT', 'CAST',
    'DATEADD', 'DATEDIFF', 'GETDATE', 'YEAR', 'MONTH', 'DAY', 'LEN', 'SUBSTRING',
    'UPPER', 'LOWER', 'RTRIM', 'LTRIM', 'CONCAT', 'REPLACE'
  ];
  
  // Create a regex pattern for keywords that ensures they are matched as whole words
  const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
  const functionPattern = new RegExp(`\\b(${functions.join('|')})\\b`, 'gi');
  
  // Patterns for other SQL elements
  const stringPattern = /'[^']*'|"[^"]*"/g;
  const numberPattern = /\b\d+(\.\d+)?\b/g;
  const operatorPattern = /[=<>!]+|\bAND\b|\bOR\b|\bIN\b|\bIS\b|\bLIKE\b|\bBETWEEN\b|\bNOT\b/gi;
  const commentPattern = /--.*$/gm;
  
  // Replace patterns with styled spans
  let highlightedSql = sql
    .replace(commentPattern, match => `<span class="sql-comment">${match}</span>`)
    .replace(stringPattern, match => `<span class="sql-string">${match}</span>`)
    .replace(numberPattern, match => `<span class="sql-number">${match}</span>`)
    .replace(functionPattern, match => `<span class="sql-function">${match}</span>`)
    .replace(keywordPattern, match => `<span class="sql-keyword">${match}</span>`)
    .replace(operatorPattern, match => `<span class="sql-operator">${match}</span>`);
  
  return highlightedSql;
};

const SqlDisplay = ({ sql, executionTime }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const [formattedSql, setFormattedSql] = useState('');
  
  // Format SQL with syntax highlighting
  useEffect(() => {
    setFormattedSql(highlightSql(sql));
  }, [sql]);

  // Handle copy SQL to clipboard
  const copySQL = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };

  return (
    <div className={`rounded-lg overflow-hidden mb-6 border transition-all 
      ${theme === 'dark' 
        ? 'bg-dark-surface border-dark-border' 
        : 'bg-gray-50 border-gray-200'}`}
    >
      {/* Header with toggle and copy button */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center">
          <button
            onClick={toggleExpanded}
            className={`p-1 mr-2 rounded-md hover:bg-gray-200 dark:hover:bg-dark-card transition-colors`}
            aria-label={expanded ? 'Collapse SQL' : 'Expand SQL'}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronUp className={`h-4 w-4 ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`} />
            ) : (
              <ChevronDown className={`h-4 w-4 ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`} />
            )}
          </button>
          
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-gems-orange mr-2" />
            <span className={`font-semibold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`}>
              Generated SQL Query
            </span>
            
            {/* Execution time */}
            {executionTime && (
              <span className={`ml-2 text-xs py-0.5 px-1.5 rounded-md ${theme === 'dark' ? 'bg-dark-card text-dark-text-secondary' : 'bg-white text-gray-500'}`}>
                {executionTime}ms
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={copySQL}
          className={`flex items-center p-1.5 rounded-md
            ${theme === 'dark' 
              ? 'hover:bg-gems-orange text-dark-text-secondary hover:text-white' 
              : 'hover:bg-gems-orange text-gray-500 hover:text-white'}
            transition-colors group relative`}
          title="Copy SQL"
        >
          <Copy className="h-4 w-4 mr-1" />
          <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
          
          {/* Copy ripple animation */}
          {copied && (
            <span className="absolute inset-0 rounded-md animate-ping bg-gems-orange opacity-25"></span>
          )}
        </button>
      </div>
      
      {/* SQL content */}
      {expanded && (
        <div className={`p-4 overflow-x-auto transition-all ${expanded ? 'max-h-[500px]' : 'max-h-0'}`}>
          <pre 
            className={`font-mono text-sm whitespace-pre-wrap break-all ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`}
          >
            {sql ? sql.replace(/<[^>]*>/g, '') : ''}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SqlDisplay;
