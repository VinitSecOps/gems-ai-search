import React, { useState, useMemo, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

// Import our new components
import Header from './Header';
import SearchBar from './SearchBar';
import ExampleQueries from './ExampleQueries';
import SqlDisplay from './SqlDisplay';
import SearchMeta from './SearchMeta';
import ErrorDisplay from './ErrorDisplay';
import ResultsDisplay from './ResultsDisplay';
import Footer from './Footer';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com/api' 
  : '/api';

const GEMSAISearch = () => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchMeta, setSearchMeta] = useState(null);

  // GEMS-specific example queries
  const exampleQueries = [
    "Show me active companies",
    "Find clients for company ID 1",
    "List all sites for ABC Ltd",
    "Show bookings starting this year",
    "Find candidates named John",
    "Timesheets awaiting approval",
    "Total charges by client this month",
    "Requirements needing more than 5 people",
    "Candidates hired in last 6 months",
    "Sites requiring PO numbers",
    "Candidates missing payroll numbers",
    "Simple bookings for specific site",
    "Active clients by status",
    "Cost centres for company",
    "Timesheets submitted last week"
  ];

  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // Debounced function to fetch suggestions from API
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions(exampleQueries.slice(0, 5));
      return;
    }
    
    setLoadingSuggestions(true);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/suggestions`, {
        params: { query: searchQuery }
      });
      
      if (response.data && response.data.suggestions) {
        // Mix API suggestions with examples for better user experience
        const apiSuggestions = response.data.suggestions.map(s => s.Suggestion || s);
        
        // Fall back to static suggestions if API returns empty results
        if (apiSuggestions.length === 0) {
          const lowerQuery = searchQuery.toLowerCase();
          const filtered = exampleQueries.filter(example => 
            example.toLowerCase().includes(lowerQuery)
          );
          
          const contextual = [];
          if (lowerQuery.includes('company') || lowerQuery.includes('agency')) {
            contextual.push("Active companies", "Companies by name");
          }
          if (lowerQuery.includes('client')) {
            contextual.push("Clients by status", "Clients for company");
          }
          if (lowerQuery.includes('candidate')) {
            contextual.push("Recent candidates", "Candidates by company");
          }
          
          setSuggestions([...new Set([...filtered, ...contextual])].slice(0, 6));
        } else {
          setSuggestions([...new Set(apiSuggestions)].slice(0, 6));
        }
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      
      // Fall back to client-side filtering
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = exampleQueries.filter(example => 
        example.toLowerCase().includes(lowerQuery)
      );
      setSuggestions(filtered.slice(0, 6));
    } finally {
      setLoadingSuggestions(false);
    }
  }, [exampleQueries]);
  
  // Debounce input to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
    
    return () => clearTimeout(handler);
  }, [query, fetchSuggestions]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    setResults(null);
    setGeneratedSQL('');
    setSearchMeta(null);
    setPage(1);
    
    // Add search animation effect
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
      searchBar.classList.add('animate-pulse-orange');
      setTimeout(() => {
        searchBar.classList.remove('animate-pulse-orange');
      }, 1000);
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/search`, {
        query: query.trim()
      });
      
      if (response.data && response.data.results) {
        // Enhance results with enum display values if applicable
        const enhancedResults = response.data.results.map(row => {
          const enhancedRow = { ...row };
          
          // Add display text for known enum fields
          if (row.hasOwnProperty('StatusId')) {
            if (enhancedRow._StatusText === undefined) {
              if (row.StatusId === 1) enhancedRow._StatusText = 'Draft';
              else if (row.StatusId === 2) enhancedRow._StatusText = 'Submitted';
              else if (row.StatusId === 3) enhancedRow._StatusText = 'Approved';
              else if (row.StatusId === 5) enhancedRow._StatusText = 'Invoiced';
            }
          }
          
          if (row.hasOwnProperty('ClientStatusId')) {
            if (enhancedRow._ClientStatusText === undefined) {
              if (row.ClientStatusId === 1) enhancedRow._ClientStatusText = 'Active';
              else if (row.ClientStatusId === 2) enhancedRow._ClientStatusText = 'Inactive';
            }
          }
          
          if (row.hasOwnProperty('BookingStatusId')) {
            if (enhancedRow._BookingStatusText === undefined) {
              if (row.BookingStatusId === 1) enhancedRow._BookingStatusText = 'Draft';
              else if (row.BookingStatusId === 2) enhancedRow._BookingStatusText = 'Active';
              else if (row.BookingStatusId === 3) enhancedRow._BookingStatusText = 'Completed';
              else if (row.BookingStatusId === 4) enhancedRow._BookingStatusText = 'Cancelled';
            }
          }
          
          return enhancedRow;
        });
        
        setResults(enhancedResults);
      } else {
        setResults([]);
      }
      
      setGeneratedSQL(response.data.sql || '');
      setSearchMeta(response.data.meta || null);
      
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.error || 'Search failed. Please try again.';
      
      // Create detailed error message with suggestions
      let fullErrorMessage = errorMessage;
      if (errorData.details) {
        fullErrorMessage += `\n\nDetails: ${errorData.details}`;
      }
      if (errorData.step) {
        fullErrorMessage += `\n\nFailed at: ${errorData.step.replace(/_/g, ' ')}`;
      }
      if (errorData.suggestions && errorData.suggestions.length > 0) {
        fullErrorMessage += '\n\nSuggestions:\n• ' + errorData.suggestions.join('\n• ');
      }
      
      setError(fullErrorMessage);
      
      // Show generated SQL even if query failed
      if (errorData.sql) {
        setGeneratedSQL(errorData.sql);
      }
      
      // Log detailed error for debugging
      console.error('Search Error Details:', {
        query,
        error: errorData,
        fullError: err
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = useCallback((example) => {
    setQuery(example);
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  // Pagination logic
  const paginatedResults = useMemo(() => {
    if (!results) return [];
    const start = (page - 1) * pageSize;
    return results.slice(start, start + pageSize);
  }, [results, page, pageSize]);

  const totalPages = results ? Math.ceil(results.length / pageSize) : 0;
  const columns = useMemo(() => {
    if (!paginatedResults.length) return [];
    return Object.keys(paginatedResults[0]);
  }, [paginatedResults]);

  const formatCellValue = (value) => {
    if (value === null || value === undefined) {
      return <span className={`italic ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-400'}`}>null</span>;
    }
    if (typeof value === 'boolean') {
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value 
            ? theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800' 
            : theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      );
    }
    if (typeof value === 'number' && value % 1 !== 0) {
      return value.toFixed(2);
    }
    return String(value);
  };

  const formatColumnName = (columnName) => {
    return columnName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/Id$/, 'ID');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark-bg' : 'bg-gradient-to-br from-white to-light-surface'} p-4 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        {/* Header with animated particles */}
        <Header />

        {/* Search Interface with new SearchBar component */}
        <div className={`${theme === 'dark' ? 'bg-dark-surface border-dark-border' : 'bg-white border-gray-100'} rounded-xl shadow-lg p-6 mb-6 border transition-theme`}>
          {/* Search Bar Component */}
          <SearchBar 
            query={query}
            setQuery={setQuery}
            loading={loading}
            suggestions={suggestions}
            loadingSuggestions={loadingSuggestions}
            handleSearch={handleSearch}
            handleKeyPress={handleKeyPress}
            handleExampleClick={handleExampleClick}
          />

          {/* Example Queries Component */}
          <ExampleQueries 
            exampleQueries={exampleQueries}
            handleExampleClick={handleExampleClick}
          />
        </div>

        {/* Generated SQL Display with syntax highlighting */}
        {generatedSQL && (
          <SqlDisplay 
            sql={generatedSQL} 
            executionTime={searchMeta?.duration} 
          />
        )}

        {/* Search Meta Information */}
        {searchMeta && (
          <SearchMeta meta={searchMeta} />
        )}

        {/* Error Display */}
        {error && (
          <ErrorDisplay error={error} />
        )}

        {/* Results Display with card/table toggle */}
        {results && (
          <ResultsDisplay 
            results={results}
            columns={columns}
            paginatedResults={paginatedResults}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={totalPages}
            formatColumnName={formatColumnName}
            formatCellValue={formatCellValue}
          />
        )}

        {/* Footer Component */}
        <Footer />
      </div>
    </div>
  );
};

export default GEMSAISearch;