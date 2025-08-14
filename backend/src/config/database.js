import mssql from 'mssql';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/database.log' })
  ]
});

// Log database configuration values for debugging
logger.info('Setting up database connection with:');
logger.info('DB_HOST: ' + process.env.DB_HOST);
logger.info('DB_NAME: ' + process.env.DB_NAME);

const sqlConfig = {
  server: process.env.DB_HOST || '34.251.233.38', // Provide a default if undefined
  database: process.env.DB_NAME || 'GEMS-UAT',
  user: process.env.DB_USER || 'SimplicityWebSQL',
  password: process.env.DB_PASSWORD || 'true-tirade-muddy23',
  port: Number(process.env.DB_PORT || 1433),
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  },
  pool: {
    max: 20,
    min: 4,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000
  }
};

let pool;
let poolConnect;

export const initializeDatabase = async () => {
  try {
    pool = new mssql.ConnectionPool(sqlConfig);
    poolConnect = pool.connect();
    
    pool.on('connect', () => {
      logger.info('Connected to GEMS database');
    });
    
    pool.on('error', (err) => {
      logger.error('Database pool error:', err);
    });
    
    await poolConnect;
    return pool;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

export const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  return pool;
};

export const executeQuery = async (sql, parameters = []) => {
  try {
    await poolConnect;
    const request = pool.request();
    
    // Add parameters to request
    if (Array.isArray(parameters)) {
      parameters.forEach((param, index) => {
        request.input(`p${index}`, param);
      });
    }
    
    logger.info('Executing SQL:', { sql, paramCount: parameters.length });
    const result = await request.query(sql);
    
    return result.recordset;
  } catch (error) {
    logger.error('Query execution failed:', { sql, error: error.message });
    throw error;
  }
};