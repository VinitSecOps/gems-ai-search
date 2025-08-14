import express from 'express';
import rateLimit from 'express-rate-limit';
import { 
  convertNaturalLanguageToSQL, 
  extractParameters, 
  recordSearchHistory, 
  getSearchSuggestions 
} from '../services/nlpToSql.js';
import { executeQuery } from '../config/database.js';
import { validateSql, validateSearchRequest } from '../middleware/security.js';
import { enhanceResultsWithEnumDisplayText } from '../services/enumMappingService.js';
import winston from 'winston';

const router = express.Router();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/search.log' })
  ]
});

// Rate limiting for search endpoint
const searchLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX) || 60,
  message: {
    error: 'Too many search requests, please try again later'
  }
});

// New endpoint for search suggestions as user types
router.get('/suggestions', async (req, res) => {
  const { query } = req.query;
  const userId = req.user?.id || null; // If you have authentication
  
  if (!query || query.length < 2) {
    return res.json({ suggestions: [] });
  }
  
  try {
    const suggestions = await getSearchSuggestions(query, userId, 7);
    res.json({ suggestions });
  } catch (error) {
    logger.error('Error getting suggestions:', error);
    res.status(500).json({ 
      error: 'Failed to get suggestions',
      suggestions: [] 
    });
  }
});

router.post('/search', searchLimiter, validateSearchRequest, async (req, res) => {
  const startTime = Date.now();
  const { query, parameters = [] } = req.body;
  const userId = req.user?.id || null; // If you have authentication
  
  try {
    logger.info('Search request received:', { query, ip: req.ip });
    
    // Step 1: Convert natural language to SQL
    let sql;
    try {
      sql = await convertNaturalLanguageToSQL(query);
    } catch (nlpError) {
      logger.error('NLP conversion failed:', { query, error: nlpError.message });
      return res.status(400).json({
        error: 'Failed to understand the query',
        details: nlpError.message,
        step: 'NLP_CONVERSION',
        suggestions: [
          'Try rephrasing your query',
          'Be more specific about what data you want',
          'Use terms like "show", "find", "list" to start your query'
        ]
      });
    }
    
    // Step 2: Validate generated SQL
    const validationError = validateSql(sql);
    if (validationError) {
      logger.warn('SQL validation failed:', { sql, error: validationError, query });
      return res.status(400).json({
        error: 'Generated query failed security validation',
        details: validationError,
        sql: sql,
        step: 'SQL_VALIDATION',
        suggestions: [
          'Try a simpler query',
          'Avoid complex operations',
          'Use basic search terms'
        ]
      });
    }
    
    // Step 3: Extract and validate parameters
    const expectedParams = extractParameters(sql);
    if (expectedParams > parameters.length) {
      logger.warn('Parameter mismatch:', { 
        sql, 
        expectedParams, 
        providedParams: parameters.length,
        query 
      });
      
      // For now, let's try without parameters for simple queries
      const parameterlessSQL = sql.replace(/@p\d+/g, "''");
      logger.info('Attempting parameterless execution:', { originalSQL: sql, modifiedSQL: parameterlessSQL });
      
      try {
        const results = await executeQuery(`SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;\n${parameterlessSQL}`, []);
        const duration = Date.now() - startTime;
        
        // Enhance results with enum display values
        const enhancedResults = await enhanceResultsWithEnumDisplayText(results);
        
        // Record successful search in history
        await recordSearchHistory(
          query,
          parameterlessSQL,
          results.length,
          duration,
          userId,
          req.ip,
          req.get('User-Agent'),
          true
        );
        
        return res.json({
          sql: sql,
          executedSQL: parameterlessSQL,
          results: enhancedResults,
          meta: {
            count: results.length,
            duration: duration,
            timestamp: new Date().toISOString(),
            warning: 'Query parameters were automatically handled'
          }
        });
      } catch (paramError) {
        logger.error('Parameterless execution failed:', { sql: parameterlessSQL, error: paramError.message });
        return res.status(400).json({
          error: 'Query requires specific parameters',
          details: `Expected ${expectedParams} parameters but got ${parameters.length}`,
          sql: sql,
          step: 'PARAMETER_MISMATCH',
          suggestions: [
            'Try a more general query without specific values',
            'Rephrase to avoid filtering by specific names or IDs'
          ]
        });
      }
    }
    
    // Step 4: Execute with proper parameters
    try {
      const safeSQL = `SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;\n${sql}`;
      const results = await executeQuery(safeSQL, parameters);
      
      const duration = Date.now() - startTime;
      logger.info('Search completed:', { 
        query, 
        resultCount: results.length, 
        duration 
      });
      
      res.json({
        sql: sql,
        results: results,
        meta: {
          count: results.length,
          duration: duration,
          timestamp: new Date().toISOString()
        }
      });
    } catch (dbError) {
      logger.error('Database execution failed:', { sql, error: dbError.message, query });
      return res.status(500).json({
        error: 'Database query failed',
        details: dbError.message,
        sql: sql,
        step: 'DATABASE_EXECUTION',
        suggestions: [
          'The query might reference non-existent tables or columns',
          'Try a simpler query',
          'Check if the data you\'re looking for exists'
        ]
      });
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Unexpected search error:', { 
      query, 
      error: error.message,
      stack: error.stack,
      duration 
    });
    
    res.status(500).json({
      error: 'Unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      step: 'UNEXPECTED_ERROR',
      suggestions: [
        'Try again in a few moments',
        'If the problem persists, try a different query'
      ]
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;