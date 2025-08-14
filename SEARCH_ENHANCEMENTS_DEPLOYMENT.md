# GEMS AI Search Enhancements - Deployment

This document outlines the steps to deploy the search enhancements that improve handling of enum values, add search history, and implement synonym mapping.

## 1. Database Enhancements

### Step 1: Execute SQL Enhancement Scripts

Run these scripts in the following order:

1. First, execute the search_enhancements.sql script to create new tables and views:

```bash
# Using sqlcmd with Windows Authentication
sqlcmd -S [your-server] -d GEMS-UAT -E -i database\schema\search_enhancements.sql

# Using SQL Server Management Studio
# Open and execute database\schema\search_enhancements.sql
```

2. Then, execute the enum mappings script to populate the enum values:

```bash
# Using sqlcmd with Windows Authentication
sqlcmd -S [your-server] -d GEMS-UAT -E -i database\schema\enum_mappings.sql

# Using SQL Server Management Studio
# Open and execute database\schema\enum_mappings.sql
```

### Step 2: Verify Database Changes

Run the verification script to ensure the database changes were applied correctly:

```bash
# Using the provided batch script
database\verify.bat

# Or directly with sqlcmd
sqlcmd -S [your-server] -d GEMS-UAT -E -i database\verify_enhancements.sql -o verification_results.txt
```

Check the output to make sure all tables, views, stored procedures, and data were created successfully.

## 2. Backend Integration

### Step 1: Update Backend Files

The following files need to be updated/created:

- `backend/src/services/nlpToSql.js` - Enhanced to support synonyms and enum values
- `backend/src/services/statusMappingService.js` - New service for handling enum mappings
- `backend/src/routes/search.js` - Updated to record search history

### Step 2: Verify Backend Changes

Run the Node.js verification script to ensure the backend can access the new database objects:

```bash
cd backend
node verify_enhancements.js
```

### Step 3: Restart Backend Server

```bash
# If running directly with Node.js
cd backend
pm2 restart all
# or
node src/server.js

# If using Docker
docker-compose -f docker/docker-compose.yml restart backend
```

## 3. Troubleshooting Common Issues

### Issue 1: SQL Error - Objects already exist

If you encounter errors about objects already existing:
- The scripts have been updated with IF NOT EXISTS checks
- You can safely run them again, or modify them to drop and recreate objects if needed

### Issue 2: SQL Error - Invalid column names

If you encounter "Invalid column name" errors:
- Some tables might not have the exact columns referenced in the scripts
- The view has been modified to use GETDATE() instead of accessing CreatedDate columns

### Issue 3: Backend Can't Connect to Database

- Verify database credentials in backend/src/config/database.js
- Check if the SQL Server allows connections from the backend server

## 4. Verification Steps

After deployment, verify the enhancements:

1. Use the GEMS AI Search interface and enter queries that include status terms like "active clients" or "approved timesheets"
2. Check if numeric status values (e.g., 2) are properly translated to text (e.g., "Active")
3. Verify if abbreviations like "TS" are correctly expanded to "Timesheet"
4. Monitor the SearchHistory table to confirm searches are being recorded

## 5. Rollback Plan

If issues occur and you need to roll back:

```sql
-- Drop the new database objects
DROP VIEW IF EXISTS dbo.vw_SearchCommonEntities;
DROP PROCEDURE IF EXISTS dbo.sp_GetSearchSuggestions;
DROP PROCEDURE IF EXISTS dbo.sp_RecordSearchHistory;
DROP TABLE IF EXISTS dbo.SearchHistory;
DROP TABLE IF EXISTS dbo.SearchSynonyms;
DROP TABLE IF EXISTS dbo.EnumMappings;
```

And revert to the previous version of the backend files.
