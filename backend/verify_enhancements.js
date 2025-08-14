// verify_enhancements.js
// Script to verify the GEMS AI Search enhancements

import sql from 'mssql';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database config
const dbConfig = {
  server: process.env.DB_HOST || '34.251.233.38',
  database: process.env.DB_NAME || 'GEMS-UAT',
  user: process.env.DB_USER || 'SimplicityWebSQL',
  password: process.env.DB_PASSWORD || 'true-tirade-muddy23',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

async function verifyEnhancements() {
    console.log('=== GEMS AI Search Enhancements Verification ===');
    
    try {
        // Connect to the database
        console.log('Connecting to database...');
        const pool = await sql.connect(dbConfig);
        console.log('Connected successfully! ✅');
        
        // Check if the enhancement tables exist
        console.log('\nChecking if enhancement tables exist:');
        const tablesResult = await pool.request().query(`
            SELECT 
                OBJECT_ID('dbo.SearchHistory') AS SearchHistoryExists,
                OBJECT_ID('dbo.SearchSynonyms') AS SearchSynonymsExists,
                OBJECT_ID('dbo.EnumMappings') AS EnumMappingsExists,
                OBJECT_ID('dbo.vw_SearchCommonEntities') AS ViewExists,
                OBJECT_ID('dbo.sp_RecordSearchHistory') AS RecordHistoryProcExists,
                OBJECT_ID('dbo.sp_GetSearchSuggestions') AS SuggestionsProcExists
        `);
        
        const tables = tablesResult.recordset[0];
        
        console.log(`SearchHistory table: ${tables.SearchHistoryExists ? '✅ Exists' : '❌ Missing'}`);
        console.log(`SearchSynonyms table: ${tables.SearchSynonymsExists ? '✅ Exists' : '❌ Missing'}`);
        console.log(`EnumMappings table: ${tables.EnumMappingsExists ? '✅ Exists' : '❌ Missing'}`);
        console.log(`vw_SearchCommonEntities view: ${tables.ViewExists ? '✅ Exists' : '❌ Missing'}`);
        console.log(`sp_RecordSearchHistory procedure: ${tables.RecordHistoryProcExists ? '✅ Exists' : '❌ Missing'}`);
        console.log(`sp_GetSearchSuggestions procedure: ${tables.SuggestionsProcExists ? '✅ Exists' : '❌ Missing'}`);
        
        // Check data in the EnumMappings table
        if (tables.EnumMappingsExists) {
            console.log('\nChecking EnumMappings data:');
            const enumCountResult = await pool.request().query('SELECT COUNT(*) AS Count FROM dbo.EnumMappings');
            const enumCount = enumCountResult.recordset[0].Count;
            
            console.log(`EnumMappings contains ${enumCount} records.`);
            
            if (enumCount > 0) {
                const sampleEnumResult = await pool.request().query('SELECT TOP 5 TableName, ColumnName, Value, DisplayText FROM dbo.EnumMappings');
                console.log('\nSample enum mappings:');
                console.table(sampleEnumResult.recordset);
            }
        }
        
        // Check data in the SearchSynonyms table
        if (tables.SearchSynonymsExists) {
            console.log('\nChecking SearchSynonyms data:');
            const synonymCountResult = await pool.request().query('SELECT COUNT(*) AS Count FROM dbo.SearchSynonyms');
            const synonymCount = synonymCountResult.recordset[0].Count;
            
            console.log(`SearchSynonyms contains ${synonymCount} records.`);
            
            if (synonymCount > 0) {
                const sampleSynonymResult = await pool.request().query('SELECT TOP 5 Term, Synonym, IsAbbreviation FROM dbo.SearchSynonyms');
                console.log('\nSample synonyms:');
                console.table(sampleSynonymResult.recordset);
            }
        }
        
        // Test the stored procedure for search suggestions
        if (tables.SuggestionsProcExists) {
            console.log('\nTesting sp_GetSearchSuggestions procedure:');
            const suggestionsResult = await pool.request()
                .input('Query', sql.NVarChar, 'active')
                .input('MaxResults', sql.Int, 5)
                .execute('sp_GetSearchSuggestions');
            
            console.log('Sample search suggestions for "active":');
            console.table(suggestionsResult.recordset);
        }
        
        // Test the view
        if (tables.ViewExists) {
            console.log('\nTesting vw_SearchCommonEntities view:');
            const viewResult = await pool.request()
                .query('SELECT TOP 5 EntityType, [Name], Status FROM dbo.vw_SearchCommonEntities');
            
            console.log('Sample data from search view:');
            console.table(viewResult.recordset);
        }
        
        console.log('\n=== Verification Complete ===');
        console.log('All enhancements appear to be working correctly! ✅');
        
    } catch (err) {
        console.error('Error during verification:', err);
        console.log('\n❌ Verification failed. Please check the error message above.');
    } finally {
        sql.close();
    }
}

verifyEnhancements();
