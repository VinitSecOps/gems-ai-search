import React, { useState } from 'react';
import { Database, GridIcon, List, ChevronLeft, ChevronRight, Download, Copy } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ResultsDisplay = ({ 
  results,
  columns,
  paginatedResults,
  page,
  setPage,
  pageSize,
  setPageSize,
  totalPages,
  formatColumnName,
  formatCellValue
}) => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  // Handle view mode toggle
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'cards' ? 'table' : 'cards');
  };

  // Handle export to CSV
  const exportToCSV = () => {
    if (!results || !results.length) return;
    
    // Create CSV content
    const headers = columns.map(col => `"${formatColumnName(col)}"`).join(',');
    const rows = results.map(row => {
      return columns.map(col => {
        const value = row[col];
        if (value === null || value === undefined) return '""';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        return `"${value}"`;
      }).join(',');
    }).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `gems_search_results_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy row data to clipboard
  const copyRowData = (row, index) => {
    const rowText = columns.map(col => {
      const name = formatColumnName(col);
      const value = row[col] === null || row[col] === undefined ? 'null' : row[col];
      return `${name}: ${value}`;
    }).join('\n');
    
    navigator.clipboard.writeText(rowText);
    
    // Show copy confirmation
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Status color mapping
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-200 text-gray-800';
    
    const statusLower = typeof status === 'string' ? status.toLowerCase() : '';
    
    if (statusLower.includes('active') || statusLower === 'approved') {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    } else if (statusLower === 'draft') {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    } else if (statusLower === 'submitted') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    } else if (statusLower.includes('complet')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    } else if (statusLower.includes('cancel') || statusLower.includes('inactive')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    } else if (statusLower.includes('invoice')) {
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    }
    
    // Default orange theme color
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  };

  // Helper function to check if a column looks like a status column
  const isStatusColumn = (col) => {
    const colLower = col.toLowerCase();
    return colLower.includes('status') || 
           col.endsWith('StatusId') || 
           col === '_StatusText' || 
           col === '_ClientStatusText' ||
           col === '_BookingStatusText';
  };

  // Empty state
  if (!results || !results.length) {
    return (
      <div className={`text-center py-12 ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}`}>
        <Database className={`h-16 w-16 mx-auto mb-4 ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-300'}`} />
        <p className="text-xl font-medium mb-2">No results found</p>
        <p className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-400'} text-sm max-w-md mx-auto`}>
          Try a different search or check the generated SQL for any issues.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-${theme === 'dark' ? 'dark-card' : 'white'} rounded-xl shadow-lg 
      border ${theme === 'dark' ? 'border-dark-border' : 'border-gray-100'} overflow-hidden theme-transition`}>
      {/* Header with view toggle and export */}
      <div className={`px-6 py-4 ${theme === 'dark' ? 'bg-dark-surface border-dark-border' : 'bg-gray-50 border-gray-200'} border-b flex items-center justify-between`}>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>
          Search Results ({results.length} found)
        </h3>
        
        <div className="flex items-center space-x-2">
          {/* Export button */}
          <button
            onClick={exportToCSV}
            className={`p-2 rounded-md ${theme === 'dark' 
              ? 'bg-dark-surface text-dark-text hover:bg-gems-orange hover:text-white' 
              : 'bg-white text-gray-700 hover:bg-gems-orange hover:text-white'} 
              transition-colors flex items-center`}
            title="Export as CSV"
          >
            <Download className="h-4 w-4 mr-1" />
            <span className="text-sm">Export</span>
          </button>
          
          {/* View toggle */}
          <button
            onClick={toggleViewMode}
            className={`p-2 rounded-md ${theme === 'dark' 
              ? 'bg-dark-surface text-dark-text' 
              : 'bg-white text-gray-700'} 
              transition-colors flex items-center group relative`}
            title={viewMode === 'cards' ? 'Switch to table view' : 'Switch to card view'}
          >
            {viewMode === 'cards' ? (
              <List className="h-4 w-4 mr-1" />
            ) : (
              <GridIcon className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm">View</span>
            
            {/* Tooltip */}
            <span className={`absolute top-full right-0 mt-1 px-2 py-1 rounded text-xs 
              ${theme === 'dark' ? 'bg-dark-surface text-dark-text' : 'bg-white text-gray-700'} 
              shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap`}>
              Switch to {viewMode === 'cards' ? 'table' : 'card'} view
            </span>
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Table View */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className={`min-w-full border-collapse ${theme === 'dark' ? 'text-dark-text' : 'text-gray-600'}`}>
              <thead>
                <tr className={`${theme === 'dark' ? 'border-dark-border bg-dark-surface' : 'border-gray-200 bg-gray-50'} border-b`}>
                  {columns.map((column) => (
                    <th key={column} className={`text-left py-3 px-4 font-semibold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`}>
                      {formatColumnName(column)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedResults.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className={`${theme === 'dark' ? 'border-dark-border hover:bg-dark-surface' : 'border-gray-100 hover:bg-gray-50'} 
                      border-b transition-colors group relative`}
                  >
                    {columns.map((column, colIndex) => {
                      // Special formatting for status columns
                      if (isStatusColumn(column) && typeof row[column] === 'string') {
                        const statusColor = getStatusColor(row[column]);
                        return (
                          <td key={column} className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                              {formatCellValue(row[column])}
                            </span>
                          </td>
                        );
                      }
                      
                      return (
                        <td key={column} className={`py-3 px-4 ${
                          // Left border for first cell on hover (orange highlight)
                          colIndex === 0 ? `group-hover:border-l-4 group-hover:border-gems-orange group-hover:pl-3 transition-all` : ''}`}>
                          {formatCellValue(row[column])}
                        </td>
                      );
                    })}
                    
                    {/* Quick action - only appears on hover */}
                    <td className="py-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-1/2 transform -translate-y-1/2">
                      <button 
                        onClick={() => copyRowData(row, rowIndex)}
                        className={`p-1 rounded-full ${theme === 'dark' 
                          ? 'bg-dark-surface hover:bg-gems-orange text-dark-text hover:text-white' 
                          : 'bg-white hover:bg-gems-orange text-gray-700 hover:text-white'}
                          transition-colors shadow-md`}
                        title="Copy row data"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Card View */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedResults.map((row, index) => (
              <div 
                key={index} 
                className={`rounded-xl ${theme === 'dark' 
                  ? 'bg-dark-surface border-dark-border' 
                  : 'bg-white border-gray-100'} 
                  border p-4 hover:shadow-lg transition-all relative hover-lift group`}
              >
                {/* Copy button - top right */}
                <button
                  onClick={() => copyRowData(row, index)}
                  className={`absolute top-3 right-3 p-1.5 rounded-full
                    ${theme === 'dark' 
                      ? 'bg-dark-card hover:bg-gems-orange text-dark-text-secondary hover:text-white' 
                      : 'bg-gray-100 hover:bg-gems-orange text-gray-500 hover:text-white'}
                    transition-colors`}
                  title="Copy row data"
                >
                  {copiedIndex === index ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-ping absolute h-full w-full rounded-full bg-gems-orange opacity-20"></div>
                      <Copy className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                
                {/* Main content */}
                <div className="space-y-3">
                  {columns.map((column, colIndex) => {
                    // Skip columns that are likely to be IDs or less important
                    if (column === 'Id' || column.endsWith('Id') || column.startsWith('_')) {
                      return null;
                    }
                    
                    // Featured content (first non-ID column) - larger text
                    if (colIndex === 0 || (colIndex === 1 && columns[0] === 'Id')) {
                      return (
                        <h3 
                          key={column} 
                          className={`text-lg font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'} 
                            truncate border-b ${theme === 'dark' ? 'border-dark-border' : 'border-gray-100'} pb-2`}
                        >
                          {formatCellValue(row[column])}
                        </h3>
                      );
                    }
                    
                    // Status fields - display as badges
                    if (isStatusColumn(column)) {
                      const statusColor = getStatusColor(row[column]);
                      return (
                        <div key={column} className="flex justify-between items-center">
                          <span className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}`}>
                            {formatColumnName(column)}:
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                            {formatCellValue(row[column])}
                          </span>
                        </div>
                      );
                    }
                    
                    // Regular fields
                    return (
                      <div key={column} className="flex justify-between items-center">
                        <span className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}`}>
                          {formatColumnName(column)}:
                        </span>
                        <span className={`text-sm ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'} font-medium truncate max-w-[60%]`}>
                          {formatCellValue(row[column])}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Orange bottom border on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-0 bg-gems-orange group-hover:h-1 transition-all duration-200 rounded-b-xl"></div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                  ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''} 
                  ${theme === 'dark'
                    ? 'bg-dark-surface text-dark-text border-dark-border hover:border-gems-orange'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gems-orange'
                  } border transition-colors`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </button>
              
              <span className={`text-sm ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`}>
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium
                  ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}
                  ${theme === 'dark'
                    ? 'bg-dark-surface text-dark-text border-dark-border hover:border-gems-orange'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gems-orange'
                  } border transition-colors`}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-700'}`}>
                Show:
              </label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className={`border rounded-md px-2 py-1 text-sm
                  ${theme === 'dark'
                    ? 'bg-dark-surface border-dark-border text-dark-text'
                    : 'bg-white border-gray-300 text-gray-700'
                  }`}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-700'}`}>
                per page
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;
