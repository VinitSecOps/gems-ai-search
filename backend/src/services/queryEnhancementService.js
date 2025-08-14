// queryEnhancementService.js - Enhances and optimizes SQL queries
import winston from 'winston';

// Set up logger
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
 * Provides intelligent fuzzy matching for name fields in SQL queries
 * @param {string} sql - The SQL query to enhance
 * @param {string} userQuery - The original user query
 * @returns {string} - The enhanced SQL query with fuzzy name matching
 */
export const enhanceNameSearches = (sql, userQuery) => {
  try {
    // Only apply to queries that look like they're searching for names
    if (!/\b(find|search|show|get)\b.+\b(named|name|called|surname|firstname)\b/i.test(userQuery)) {
      return sql;
    }
    
    // Extract potential name values from LIKE conditions
    const nameMatches = sql.match(/(\w+)\s+LIKE\s+['"]%([^%'"]+)%['"]/gi);
    if (!nameMatches) return sql;
    
    let enhancedSql = sql;
    
    // Common name variations that could be used
    const nameVariations = [
      { base: 'john', variations: ['jon', 'johnny', 'jonathan'] },
      { base: 'bob', variations: ['robert', 'rob', 'bobby'] },
      { base: 'will', variations: ['william', 'bill', 'billy'] },
      { base: 'mike', variations: ['michael', 'mick', 'mikey'] },
      { base: 'jim', variations: ['james', 'jimmy', 'jamie'] },
      { base: 'dave', variations: ['david', 'davey'] },
      { base: 'tom', variations: ['thomas', 'tommy'] },
      { base: 'steve', variations: ['steven', 'stephen'] },
      { base: 'dan', variations: ['daniel', 'danny'] },
      { base: 'alex', variations: ['alexander', 'alexandra', 'alexis'] },
      { base: 'kate', variations: ['katherine', 'catherine', 'kathy', 'katie'] },
      { base: 'liz', variations: ['elizabeth', 'eliza', 'beth', 'lizzy'] },
      { base: 'jen', variations: ['jennifer', 'jenny'] },
      { base: 'chris', variations: ['christopher', 'christine'] },
      { base: 'smith', variations: ['smyth'] }
    ];
    
    // Process each name match
    for (const match of nameMatches) {
      const parts = match.match(/(\w+)\s+LIKE\s+['"]%([^%'"]+)%['"]/i);
      if (!parts || parts.length < 3) continue;
      
      const column = parts[1];
      const searchName = parts[2].toLowerCase();
      
      // Find any variations for this name
      const variations = [];
      
      // Check if the name matches any base name
      for (const nameSet of nameVariations) {
        if (searchName === nameSet.base) {
          // Add variations to the list
          variations.push(...nameSet.variations);
          break;
        }
        
        // Check if it matches any variation
        if (nameSet.variations.includes(searchName)) {
          // Add the base and other variations
          variations.push(nameSet.base);
          variations.push(...nameSet.variations.filter(v => v !== searchName));
          break;
        }
      }
      
      // If we found variations, enhance the query
      if (variations.length > 0) {
        const originalCondition = new RegExp(`${column}\\s+LIKE\\s+['"]%${searchName}%['"]`, 'i');
        let replacementCondition = `(${column} LIKE '%${searchName}%'`;
        
        // Add conditions for each variation
        for (const variation of variations) {
          replacementCondition += ` OR ${column} LIKE '%${variation}%'`;
        }
        replacementCondition += ')';
        
        enhancedSql = enhancedSql.replace(originalCondition, replacementCondition);
        logger.info(`Enhanced name search with variations:`, {
          original: searchName,
          variations: variations,
          originalCondition: originalCondition.toString(),
          enhancedCondition: replacementCondition
        });
      }
    }
    
    return enhancedSql;
  } catch (error) {
    logger.error('Error enhancing name searches:', error);
    return sql;
  }
};

/**
 * Enhances date-based searches with smart date parsing
 * @param {string} sql - The SQL query to enhance
 * @param {string} userQuery - The original user query
 * @returns {string} - The enhanced SQL query with improved date handling
 */
export const enhanceDateSearches = (sql, userQuery) => {
  try {
    // Extract year references from user query
    const yearMatches = userQuery.match(/\b(20\d{2})\b/g);
    if (!yearMatches) return sql;
    
    const year = yearMatches[0];
    
    // Replace simple date conditions with better optimized ones
    // Optimize YEAR() functions when possible
    const yearFnPattern = /YEAR\((\w+)\)\s*=\s*(\d{4})/gi;
    sql = sql.replace(yearFnPattern, (match, column, matchedYear) => {
      // Replace with range condition for better index usage
      return `${column} >= '${matchedYear}-01-01' AND ${column} < '${parseInt(matchedYear) + 1}-01-01'`;
    });
    
    // Extract month references
    const monthMatches = userQuery.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\b/i);
    if (monthMatches) {
      const month = monthMatches[1].toLowerCase();
      const year = monthMatches[2];
      
      // Map month name to number
      const monthMap = {
        'january': '01', 'february': '02', 'march': '03', 'april': '04',
        'may': '05', 'june': '06', 'july': '07', 'august': '08',
        'september': '09', 'october': '10', 'november': '11', 'december': '12'
      };
      
      const monthNumber = monthMap[month];
      if (monthNumber) {
        // Calculate next month for range
        let nextMonthNumber = parseInt(monthNumber) + 1;
        let nextMonthYear = parseInt(year);
        
        if (nextMonthNumber > 12) {
          nextMonthNumber = 1;
          nextMonthYear++;
        }
        
        const nextMonth = nextMonthNumber.toString().padStart(2, '0');
        
        // Look for date-related columns and add appropriate conditions
        const dateColumns = ['TimesheetEndDate', 'TimesheetStartDate', 'StartDate', 'EndDate', 'Date'];
        for (const column of dateColumns) {
          if (sql.includes(column)) {
            // Check if we already have a condition for this column
            if (!new RegExp(`\\b${column}\\b.*(BETWEEN|>=|YEAR)`, 'i').test(sql)) {
              // Add the condition to the WHERE clause
              if (sql.includes(' WHERE ')) {
                sql = sql.replace(/\bWHERE\b/i, `WHERE ${column} >= '${year}-${monthNumber}-01' AND ${column} < '${nextMonthYear}-${nextMonth}-01' AND `);
              } else {
                sql += ` WHERE ${column} >= '${year}-${monthNumber}-01' AND ${column} < '${nextMonthYear}-${nextMonth}-01'`;
              }
              break; // Only add for one column
            }
          }
        }
      }
    }
    
    return sql;
  } catch (error) {
    logger.error('Error enhancing date searches:', error);
    return sql;
  }
};

/**
 * Apply performance optimizations to SQL queries
 * @param {string} sql - The SQL query to optimize
 * @returns {string} - The optimized SQL query
 */
export const optimizeQueryPerformance = (sql) => {
  try {
    let optimizedSql = sql;
    
    // Ensure query has a TOP limit
    if (!/ TOP \d+/i.test(optimizedSql)) {
      optimizedSql = optimizedSql.replace(/^SELECT /i, 'SELECT TOP 100 ');
    }
    
    // Add reasonable sorting when missing
    if (!/ ORDER BY /i.test(optimizedSql)) {
      // Check what tables are involved
      if (/\bTimesheets\b/i.test(optimizedSql)) {
        optimizedSql += ' ORDER BY TimesheetEndDate DESC';
      } else if (/\bBookings\b/i.test(optimizedSql)) {
        optimizedSql += ' ORDER BY StartDate DESC';
      } else if (/\bCandidates\b/i.test(optimizedSql)) {
        optimizedSql += ' ORDER BY Surname, FirstName';
      }
    }
    
    // Replace SELECT * with specific columns for common tables
    if (/SELECT TOP \d+ \*/i.test(optimizedSql)) {
      if (/FROM dbo\.Candidates/i.test(optimizedSql) && !/ JOIN /i.test(optimizedSql)) {
        optimizedSql = optimizedSql.replace(/SELECT TOP \d+ \*/i, 'SELECT TOP 100 Id, FirstName, Surname, Email, CompanyId');
      } else if (/FROM dbo\.Timesheets/i.test(optimizedSql) && !/ JOIN /i.test(optimizedSql)) {
        optimizedSql = optimizedSql.replace(/SELECT TOP \d+ \*/i, 'SELECT TOP 100 Id, TimesheetStartDate, TimesheetEndDate, StatusId, CandidateId');
      }
    }
    
    return optimizedSql;
  } catch (error) {
    logger.error('Error optimizing query performance:', error);
    return sql;
  }
};

/**
 * Main function to enhance and optimize a generated SQL query
 * @param {string} sql - The original SQL query 
 * @param {string} userQuery - The user's natural language query
 * @returns {string} - The enhanced and optimized SQL query
 */
export const enhanceAndOptimizeQuery = (sql, userQuery) => {
  // Apply enhancements in sequence
  let enhancedSql = sql;
  
  // Step 1: Enhance name searches
  enhancedSql = enhanceNameSearches(enhancedSql, userQuery);
  
  // Step 2: Enhance date searches
  enhancedSql = enhanceDateSearches(enhancedSql, userQuery);
  
  // Step 3: Apply performance optimizations
  enhancedSql = optimizeQueryPerformance(enhancedSql);
  
  if (enhancedSql !== sql) {
    logger.info('Query enhancement applied:', { 
      original: sql, 
      enhanced: enhancedSql 
    });
  }
  
  return enhancedSql;
};
