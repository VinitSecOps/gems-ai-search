// File: d:\Matriks Projects\gems-ai-search\backend\src\services\enumMappingService.js
import { executeQuery } from '../config/database.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/nlp.log' })
  ]
});

/**
 * Loads all enum mappings from the database
 * @returns {Promise<Map<string, Map<number, string>>>} Map of tableName.columnName to a Map of value to displayText
 */
export const loadEnumMappings = async () => {
  try {
    const mappings = await executeQuery(`
      SELECT TableName, ColumnName, Value, DisplayText
      FROM dbo.EnumMappings
      WHERE IsActive = 1
    `, []);
    
    const result = new Map();
    
    for (const mapping of mappings) {
      const key = `${mapping.TableName}.${mapping.ColumnName}`;
      
      if (!result.has(key)) {
        result.set(key, new Map());
      }
      
      const valueMap = result.get(key);
      valueMap.set(mapping.Value, mapping.DisplayText);
    }
    
    logger.info(`Loaded ${mappings.length} enum mappings`);
    return result;
  } catch (error) {
    logger.error('Failed to load enum mappings:', error);
    return new Map();
  }
};

// Cache for enum mappings to avoid repeated database queries
let enumMappingsCache = null;
let lastCacheRefresh = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Hardcoded enum values for critical entities to ensure accuracy
 * These values come directly from the system documentation and are guaranteed to be correct
 */
const CRITICAL_ENUM_MAPPINGS = {
  'Timesheets.StatusId': new Map([
    [1, 'Incomplete'],
    [2, 'PartiallyComplete'],
    [3, 'Complete'],
    [4, 'Approved'],
    [5, 'Submitted'],
    [6, 'Rejected'],
    [7, 'WaitingForAdjustApproval'],
    [8, 'AwaitingPACSProcessing'],
    [10, 'TemplatePayrollTimesheets'],
    [11, 'CandidateSDSNotificationAwaitingReview'],
    [12, 'SentForAuthorization']
  ])
};

/**
 * Gets the display text for an enum value
 * @param {string} tableName - The table name
 * @param {string} columnName - The column name
 * @param {number} value - The enum value
 * @returns {Promise<string|null>} The display text or null if not found
 */
export const getEnumDisplayText = async (tableName, columnName, value) => {
  try {
    // First check critical enums that must be exact
    const criticalKey = `${tableName}.${columnName}`;
    if (CRITICAL_ENUM_MAPPINGS[criticalKey] && CRITICAL_ENUM_MAPPINGS[criticalKey].has(value)) {
      return CRITICAL_ENUM_MAPPINGS[criticalKey].get(value);
    }
    
    // Fall back to database values for non-critical enums
    // Refresh cache if needed
    const now = Date.now();
    if (!enumMappingsCache || (now - lastCacheRefresh) > CACHE_TTL) {
      enumMappingsCache = await loadEnumMappings();
      lastCacheRefresh = now;
    }
    
    const key = `${tableName}.${columnName}`;
    const valueMap = enumMappingsCache.get(key);
    
    if (valueMap && valueMap.has(value)) {
      return valueMap.get(value);
    }
    
    return null;
  } catch (error) {
    logger.error('Error getting enum display text:', error);
    return null;
  }
};

/**
 * Gets the enum value from text description
 * @param {string} tableName - The table name
 * @param {string} columnName - The column name
 * @param {string} text - The text to look up
 * @returns {Promise<number|null>} The enum value or null if not found
 */
export const getEnumValueFromText = async (tableName, columnName, text) => {
  try {
    // First check critical enums
    const criticalKey = `${tableName}.${columnName}`;
    if (CRITICAL_ENUM_MAPPINGS[criticalKey]) {
      const lowerText = text.toLowerCase();
      for (const [value, displayText] of CRITICAL_ENUM_MAPPINGS[criticalKey].entries()) {
        if (displayText.toLowerCase() === lowerText) {
          return value;
        }
      }
    }
    
    // Refresh cache if needed
    const now = Date.now();
    if (!enumMappingsCache || (now - lastCacheRefresh) > CACHE_TTL) {
      enumMappingsCache = await loadEnumMappings();
      lastCacheRefresh = now;
    }
    
    // Look up in database mappings
    const mappings = await executeQuery(`
      SELECT Value
      FROM dbo.EnumMappings
      WHERE TableName = @tableName
        AND ColumnName = @columnName
        AND DisplayText = @text
    `, [
      { name: 'tableName', type: 'NVarChar', value: tableName },
      { name: 'columnName', type: 'NVarChar', value: columnName },
      { name: 'text', type: 'NVarChar', value: text }
    ]);
    
    if (mappings.length > 0) {
      return mappings[0].Value;
    }
    
    return null;
  } catch (error) {
    logger.error('Error getting enum value from text:', error);
    return null;
  }
};

/**
 * Enhances database results with human-readable enum values
 * @param {Array} results - The database results to enhance
 * @returns {Promise<Array>} The enhanced results
 */
export const enhanceResultsWithEnumDisplayText = async (results) => {
  if (!results || results.length === 0) {
    return results;
  }

  try {
    // Refresh cache if needed
    const now = Date.now();
    if (!enumMappingsCache || (now - lastCacheRefresh) > CACHE_TTL) {
      enumMappingsCache = await loadEnumMappings();
      lastCacheRefresh = now;
    }

    // Create a deep copy of results to avoid modifying the original
    const enhancedResults = JSON.parse(JSON.stringify(results));
    
    // Extract table name from first column (if available)
    // This is a heuristic - assumes first column name contains table info
    // Example: "TimesheetId" → "Timesheet"
    const firstKey = Object.keys(enhancedResults[0])[0];
    let tableName = '';
    if (firstKey) {
      // Extract table name from column name (e.g., "TimesheetId" → "Timesheet")
      const match = firstKey.match(/^([A-Z][a-z]+)/);
      if (match) {
        tableName = match[1] + 's'; // Convert singular to plural
      }
    }

    // Iterate through each result row
    for (const row of enhancedResults) {
      // Look for potential enum columns (typically ending with 'Id' or 'StatusId')
      for (const [columnName, value] of Object.entries(row)) {
        // Skip non-numeric values or nulls
        if (typeof value !== 'number' || value === null) continue;
        
        // Check if column looks like an enum (ends with Id)
        if (columnName.endsWith('Id') || columnName.endsWith('StatusId') || columnName.endsWith('TypeId')) {
          // Get the display text for this potential enum value
          const displayText = await getEnumDisplayText(tableName, columnName, value);
          
          // If we found a display text, add it as a new property
          if (displayText) {
            // Create a readable name (e.g., "StatusId" → "Status")
            const readableName = columnName.replace(/Id$/, '');
            row[readableName] = displayText;
          }
        }
      }
    }
    
    return enhancedResults;
  } catch (error) {
    logger.error('Error enhancing results with enum display text:', error);
    return results; // Return original results if enhancement fails
  }
};
