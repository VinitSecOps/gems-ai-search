-- GEMS AI Search - Verification Script
-- This script checks if the search enhancements have been properly applied
USE [GEMS-UAT]
GO

-- Check if the tables have been created
PRINT '=== Checking if enhancement tables exist ==='
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SearchHistory]') AND type = N'U') 
        THEN 'SearchHistory table exists ✅' 
        ELSE 'SearchHistory table does NOT exist ❌' 
    END AS TableCheck;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SearchSynonyms]') AND type = N'U') 
        THEN 'SearchSynonyms table exists ✅' 
        ELSE 'SearchSynonyms table does NOT exist ❌' 
    END AS TableCheck;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EnumMappings]') AND type = N'U') 
        THEN 'EnumMappings table exists ✅' 
        ELSE 'EnumMappings table does NOT exist ❌' 
    END AS TableCheck;

-- Check if the view exists
PRINT '=== Checking if the search view exists ==='
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[vw_SearchCommonEntities]')) 
        THEN 'vw_SearchCommonEntities view exists ✅' 
        ELSE 'vw_SearchCommonEntities view does NOT exist ❌' 
    END AS ViewCheck;

-- Check if the stored procedures exist
PRINT '=== Checking if stored procedures exist ==='
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM sys.procedures WHERE object_id = OBJECT_ID(N'[dbo].[sp_RecordSearchHistory]')) 
        THEN 'sp_RecordSearchHistory procedure exists ✅' 
        ELSE 'sp_RecordSearchHistory procedure does NOT exist ❌' 
    END AS ProcedureCheck;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM sys.procedures WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetSearchSuggestions]')) 
        THEN 'sp_GetSearchSuggestions procedure exists ✅' 
        ELSE 'sp_GetSearchSuggestions procedure does NOT exist ❌' 
    END AS ProcedureCheck;

-- Check if the initial data has been inserted
PRINT '=== Checking if initial data has been inserted ==='
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM [dbo].[SearchSynonyms]) 
        THEN 'SearchSynonyms contains ' + CAST(COUNT(*) AS NVARCHAR) + ' rows ✅' 
        ELSE 'SearchSynonyms table is empty ❌' 
    END AS DataCheck
FROM [dbo].[SearchSynonyms];

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM [dbo].[EnumMappings]) 
        THEN 'EnumMappings contains ' + CAST(COUNT(*) AS NVARCHAR) + ' rows ✅' 
        ELSE 'EnumMappings table is empty ❌' 
    END AS DataCheck
FROM [dbo].[EnumMappings];

-- Sample data check
PRINT '=== Checking sample enum mappings ==='
SELECT TOP 5 TableName, ColumnName, Value, DisplayText FROM [dbo].[EnumMappings];

PRINT '=== Checking sample synonyms ==='
SELECT TOP 5 Term, Synonym, IsAbbreviation FROM [dbo].[SearchSynonyms];

-- Check if the view returns data
PRINT '=== Checking if the search view returns data ==='
SELECT TOP 5 EntityType, [Name], Status FROM [dbo].[vw_SearchCommonEntities];
