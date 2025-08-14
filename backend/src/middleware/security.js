import { body, validationResult } from 'express-validator';

export const validateSql = (sql) => {
  const lowerSql = sql.toLowerCase().trim();
  
  // Must start with SELECT
  if (!lowerSql.startsWith('select')) {
    return "Only SELECT statements are allowed";
  }
  
  // Forbidden keywords/patterns
  const forbidden = [
    'update ', 'delete ', 'insert ', 'merge ', 'drop ', 'alter ', 
    'truncate ', 'exec ', 'execute ', 'sp_', 'xp_', '--', '/*', 
    '*/', ';', 'grant ', 'revoke ', 'create ', 'backup ', 'restore '
  ];
  
  for (const keyword of forbidden) {
    if (lowerSql.includes(keyword)) {
      return `Forbidden keyword detected: ${keyword.trim()}`;
    }
  }
  
  // Check for SELECT INTO
  if (lowerSql.includes(' into ')) {
    return "SELECT INTO statements are not allowed";
  }
  
  // Length check
  if (sql.length > 5000) {
    return "Query too long";
  }
  
  return null;
};

export const validateSearchRequest = [
  body('query')
    .isString()
    .isLength({ min: 3, max: 500 })
    .withMessage('Query must be between 3 and 500 characters')
    .trim()
    .escape(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];