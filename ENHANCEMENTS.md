# GEMS AI Search Enhancements

This document outlines the enhancements made to the GEMS AI Search system to improve its functionality and make the search experience more intuitive.

## Overview of Changes

1. **Search Memory and Learning**
   - Added search history tracking
   - Implemented intelligent suggestions based on past searches
   - Added synonym handling (e.g., "CC" → "CostCentre")

2. **Enum Handling**
   - Added database tables for mapping numeric enum values to readable text
   - Created utilities to extract enum values from GEMS codebase
   - Enhanced search results with human-readable status values

3. **Performance Improvements**
   - Added full-text indexing for better text search performance
   - Created a common search view for frequently accessed entities

## Implementation Details

### Database Changes

1. **New Tables Added:**
   - `SearchHistory` - Tracks all searches, their SQL, and result counts
   - `SearchSynonyms` - Maps abbreviations and synonyms to their canonical terms
   - `EnumMappings` - Maps numeric enum values to human-readable text

2. **New Indexes:**
   - Full-text indexes on key searchable columns
   - Optimized indexes for search performance

3. **New View:**
   - `vw_SearchCommonEntities` - Simplifies common entity searches

### Backend Changes

1. **Enhanced NLP-to-SQL Conversion:**
   - Synonym expansion before sending to OpenAI
   - Contextual learning from past successful queries
   - Better handling of abbreviations and common terms

2. **New API Endpoints:**
   - `/api/suggestions` - Returns search suggestions as users type
   - Enhanced `/api/search` with better error handling and context

3. **Enum Value Display:**
   - Automatic mapping of numeric enum values to readable text
   - Enhanced result objects with both raw and human-readable values

## Installation Steps

To fully implement these changes, follow these steps:

1. **Database Updates:**
   ```sql
   -- Run these scripts in order
   EXEC sp_executesql N'USE [GEMS-UAT]; SELECT 1;'; -- Ensure correct database
   -- Then run:
   -- 1. search_enhancements.sql
   ```

2. **Import Enum Values:**
   ```sql
   -- Run the provided enum_mappings.sql script which contains all the enum mappings
   -- from the GEMS system
   EXEC sp_executesql N'USE [GEMS-UAT]; SELECT 1;';
   :r database\schema\enum_mappings.sql
   ```

   Alternatively, if new enum values are added to the GEMS system, you can extract them:
   ```powershell
   # Run the enum extraction script pointing to your GEMS codebase
   .\database\utils\import_enums.ps1 -GemsCodePath "C:\path\to\GEMS\code" -OutputSqlFile "database\enum_mappings_new.sql"
   
   # Then run the generated SQL against your database
   ```

3. **Backend Service Updates:**
   ```bash
   # Install any new dependencies
   cd backend
   npm install
   
   # Restart the backend service
   npm run dev  # or npm start for production
   ```

4. **Frontend Updates:**
   ```bash
   # Install any new dependencies
   cd frontend
   npm install
   
   # Rebuild the frontend
   npm run build
   ```

## Required Information from GEMS Codebase

To fully integrate with the GEMS system, we need the following information from the GEMS codebase:

1. **Enum Definitions:**
   - Status enums (ClientStatus, TimesheetStatus, BookingStatus, etc.)
   - Type enums (ClientType, BookingType, CandidateType, etc.)
   - Any other relevant enums used in the database
   
   **Note:** The following enum values have already been incorporated:
   
   **Timesheet StatusId:**
   - 1: Incomplete (Awaiting Approval - Incomplete)
   - 2: Partially Complete (Awaiting Approval - Partially Incomplete)
   - 3: Complete (Awaiting Approval - Complete)
   - 4: Approved (Approved - Ready to Submit)
   - 5: Submitted (Submitted - Processed)
   - 6: Rejected (Awaiting Approval - Rejected)
   - 7: Waiting for Adjust Approval (Submitted - Awaiting Adjust Approval)
   - 8: Awaiting PACS Processing (Submitted - Awaiting PACS Processing)
   - 10: Template Payroll Timesheet (Payroll Timesheet Template)
   - 11: Awaiting SDS IR35 Review (Awaiting SDS IR35 Notification Review)
   - 12: Sent For Approval (Sent For Authorization)
   
   **Booking WorkStatusId:**
   - 1: Inactive
   - 2: Active
   - 3: Archived
   - 4: On Hold
   
   **Client ClientStatusId:**
   - 1: Inactive
   - 2: Active
   - 3: Archived
   - 4: On Hold
   
   **User RoleId:**
   - 1: Agency User
   - 2: Agency Administrator
   - 3: Simplicity Administrator
   - 4: Blueberry Administrator
   - 5: Client Basic User
   - 6: Client Timesheet User
   - 7: Client Super User
   - 8: Candidate User
   
   *Additional enum values for other entity types have also been included in the database scripts.*

2. **Common Abbreviations:**
   - Department-specific abbreviations
   - Common shorthand terms used in the organization

## Best Practices for Users

1. **Effective Searching:**
   - Use natural language queries
   - Can use abbreviations (e.g., "CC" for "CostCentre")
   - Include specific filters when needed (e.g., "active clients for company ABC")

2. **Learning from History:**
   - The system learns from past searches
   - Click on suggestions to speed up common searches
   - The more the system is used, the smarter it becomes

## Deployment Procedure

To deploy these changes to your environment, follow these steps in order:

1. **Stop Running Services**
   ```bash
   # Stop the running backend service
   cd backend
   pm2 stop all   # If using PM2
   # or use Ctrl+C if running in development mode

   # Stop the running frontend service
   cd ../frontend
   # If running in dev mode, use Ctrl+C
   ```

2. **Apply Database Changes**
   ```sql
   -- Run the schema enhancements script
   USE [GEMS-UAT];
   :r database\schema\search_enhancements.sql
   
   -- Apply enum mappings
   :r database\schema\enum_mappings.sql
   ```

3. **Update Backend Code**
   ```bash
   cd backend
   git pull   # If using version control
   npm install   # Install any new dependencies
   
   # Start the service again
   npm run dev   # For development environment
   # or
   pm2 start src/server.js   # For production using PM2
   ```

4. **Update Frontend Code**
   ```bash
   cd ../frontend
   git pull   # If using version control
   npm install   # Install any new dependencies
   npm run build   # Build the frontend
   
   # If using a development server
   npm start
   ```

5. **Verify Deployment**
   - Open the application in your browser
   - Try a search that uses the new functionality
   - Check logs for any errors:
     ```bash
     cd backend
     tail -f logs/server.log
     tail -f logs/nlp.log
     ```

## Troubleshooting

If search results aren't as expected:

1. **Check Search History:**
   - Review the SearchHistory table to see what SQL was generated
   - Look for patterns in failed searches

2. **Update Synonyms:**
   - Add missing terms to the SearchSynonyms table
   - Mark company-specific abbreviations appropriately

3. **Enum Mappings:**
   - Ensure all status values are properly mapped in EnumMappings
   - Run the enum extraction script again if GEMS code is updated
   
4. **Service Issues:**
   - Check backend logs for errors in `backend/logs/` directory
   - Ensure database connection is working
   - Verify that OpenAI API key is valid and has sufficient quota

## Status Recognition Enhancements

The system now has sophisticated status recognition capabilities that can translate natural language descriptions into the correct status values. For example:

- "Show me incomplete timesheets" → Correctly maps to `Timesheets.StatusId = 1`
- "Find active bookings" → Correctly maps to `Bookings.WorkStatusId = 2`
- "List clients on hold" → Correctly maps to `Clients.ClientStatusId = 4`
- "Requirements with interviews arranged" → Correctly maps to `Requirements.CVWorkflowStatusId = 5`

This status recognition works with:
- Exact terms ("active", "incomplete")
- Descriptive terms ("awaiting approval", "on hold")
- Context-aware recognition (distinguishes between "active clients" vs "active bookings")

## Future Enhancements

1. **User-Specific Learning:**
   - Personalized suggestions based on user role and department
   - Role-based access to certain search capabilities

2. **Advanced Analytics:**
   - Dashboards for most common searches
   - Identification of search patterns and potential UI improvements

3. **Integration with Other Systems:**
   - Potential to extend the search to other company databases
   - API endpoints for other applications to use the search capability
