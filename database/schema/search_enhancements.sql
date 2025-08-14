-- Search Enhancement Tables
USE [GEMS-UAT]
GO

-- Table to store search history
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SearchHistory]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SearchHistory](
        [Id] [int] IDENTITY(1,1) PRIMARY KEY,
        [UserId] [int] NULL,
        [Query] [nvarchar](1000) NOT NULL,
        [GeneratedSQL] [nvarchar](4000) NOT NULL,
        [ResultCount] [int] NOT NULL,
        [ExecutionTimeMs] [int] NOT NULL,
        [SearchDate] [datetime] NOT NULL DEFAULT GETDATE(),
        [IP] [nvarchar](50) NULL,
        [UserAgent] [nvarchar](500) NULL,
        [Success] [bit] NOT NULL DEFAULT 1
    ) 
END
GO

-- Table for search synonyms and abbreviations
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SearchSynonyms]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SearchSynonyms](
        [Id] [int] IDENTITY(1,1) PRIMARY KEY,
        [Term] [nvarchar](100) NOT NULL,
        [Synonym] [nvarchar](100) NOT NULL,
        [IsAbbreviation] [bit] NOT NULL DEFAULT 0,
        [CreatedDate] [datetime] NOT NULL DEFAULT GETDATE(),
        [CreatedBy] [nvarchar](100) NULL,
        [IsActive] [bit] NOT NULL DEFAULT 1
    )
END
GO

-- Initial data for synonyms
INSERT INTO [dbo].[SearchSynonyms] (Term, Synonym, IsAbbreviation)
VALUES 
('CostCentre', 'CC', 1),
('CostCentres', 'CC', 1),
('Client', 'Customer', 0),
('Clients', 'Customers', 0),
('Candidate', 'Worker', 0),
('Candidates', 'Workers', 0),
('Booking', 'Job', 0),
('Bookings', 'Jobs', 0),
('Company', 'Agency', 0),
('Companies', 'Agencies', 0),
('Site', 'Location', 0),
('Sites', 'Locations', 0),
('Timesheet', 'TS', 1),
('Timesheets', 'TS', 1),
('ActiveCompanies', 'Companies where IsActive=1', 0),
('InactiveClients', 'Clients where ClientStatusId=2', 0),
('ActiveClients', 'Clients where ClientStatusId=1', 0);

-- Table to map enum values for better readability
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EnumMappings]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[EnumMappings](
        [Id] [int] IDENTITY(1,1) PRIMARY KEY,
        [TableName] [nvarchar](100) NOT NULL,
        [ColumnName] [nvarchar](100) NOT NULL,
        [Value] [int] NOT NULL,
        [DisplayText] [nvarchar](200) NOT NULL,
        [Description] [nvarchar](500) NULL,
        [CreatedDate] [datetime] NOT NULL DEFAULT GETDATE(),
        [IsActive] [bit] NOT NULL DEFAULT 1
    )
END
GO

-- Initial data for enum mappings
INSERT INTO [dbo].[EnumMappings] (TableName, ColumnName, Value, DisplayText, Description)
VALUES 
-- Client Status
('Clients', 'ClientStatusId', 1, 'Active', 'Client is currently active'),
('Clients', 'ClientStatusId', 2, 'Inactive', 'Client is currently inactive'),

-- Timesheet Status
('Timesheets', 'StatusId', 1, 'Draft', 'Timesheet is in draft state'),
('Timesheets', 'StatusId', 2, 'Submitted', 'Timesheet has been submitted'),
('Timesheets', 'StatusId', 3, 'Approved', 'Timesheet has been approved'),
('Timesheets', 'StatusId', 5, 'Invoiced', 'Timesheet has been invoiced'),

-- Booking Status
('Bookings', 'BookingStatusId', 1, 'Draft', 'Booking is in draft state'),
('Bookings', 'BookingStatusId', 2, 'Active', 'Booking is currently active'),
('Bookings', 'BookingStatusId', 3, 'Completed', 'Booking has been completed'),
('Bookings', 'BookingStatusId', 4, 'Cancelled', 'Booking has been cancelled');

-- Create a full-text catalog for enhanced text searching
IF NOT EXISTS (SELECT * FROM sys.fulltext_catalogs WHERE name = 'GEMSSearchCatalog')
BEGIN
    CREATE FULLTEXT CATALOG GEMSSearchCatalog AS DEFAULT;
END
GO

-- Add fulltext indexes on key searchable tables
-- First, let's create the indexes if they don't exist
-- Note: This section may need to be customized based on your database schema

-- Check for primary keys
IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('dbo.Candidates'))
BEGIN
    -- Check if we have a suitable index for fulltext
    IF EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Candidates') AND is_unique = 1)
    BEGIN
        DECLARE @IndexName nvarchar(128);
        SELECT TOP 1 @IndexName = name FROM sys.indexes 
        WHERE object_id = OBJECT_ID('dbo.Candidates') AND is_unique = 1;
        
        EXEC('CREATE FULLTEXT INDEX ON dbo.Candidates(FirstName, Surname) KEY INDEX ' + @IndexName);
    END
END

-- Skip other full-text indexes for now to avoid errors
-- You can add them back once you confirm the correct index names

-- Example commented out for safety:
/*
IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('dbo.Clients'))
BEGIN
    IF EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Clients') AND is_unique = 1)
    BEGIN
        DECLARE @ClientsIndexName nvarchar(128);
        SELECT TOP 1 @ClientsIndexName = name FROM sys.indexes 
        WHERE object_id = OBJECT_ID('dbo.Clients') AND is_unique = 1;
        
        EXEC('CREATE FULLTEXT INDEX ON dbo.Clients(Name, ClientNumber) KEY INDEX ' + @ClientsIndexName);
    END
END
*/

-- Create a view to simplify common search patterns
GO
CREATE OR ALTER VIEW [dbo].[vw_SearchCommonEntities]
AS
SELECT 
    'Company' AS EntityType,
    c.Id,
    c.CompanyName AS [Name],
    CASE c.IsActive WHEN 1 THEN 'Active' ELSE 'Inactive' END AS Status,
    NULL AS RelatedId,
    NULL AS RelatedName,
    GETDATE() AS CreatedDate -- Default to current date if column doesn't exist
FROM dbo.Company c

UNION ALL

SELECT 
    'Client' AS EntityType,
    cl.Id,
    cl.Name,
    CASE cl.ClientStatusId WHEN 1 THEN 'Active' ELSE 'Inactive' END AS Status,
    cl.CompanyId AS RelatedId,
    co.CompanyName AS RelatedName,
    GETDATE() AS CreatedDate -- Default to current date if column doesn't exist
FROM dbo.Clients cl
JOIN dbo.Company co ON cl.CompanyId = co.Id

UNION ALL

SELECT 
    'Site' AS EntityType,
    s.Id,
    s.Name,
    'N/A' AS Status,
    s.ClientId AS RelatedId,
    c.Name AS RelatedName,
    GETDATE() AS CreatedDate -- Default to current date if column doesn't exist
FROM dbo.Sites s
JOIN dbo.Clients c ON s.ClientId = c.Id

UNION ALL

SELECT 
    'Candidate' AS EntityType,
    ca.Id,
    CONCAT(ca.FirstName, ' ', ca.Surname) AS [Name],
    'N/A' AS Status,
    ca.CompanyId AS RelatedId,
    co.CompanyName AS RelatedName,
    GETDATE() AS CreatedDate -- Default to current date if column doesn't exist
FROM dbo.Candidates ca
JOIN dbo.Company co ON ca.CompanyId = co.Id

UNION ALL

SELECT 
    'CostCentre' AS EntityType,
    cc.Id,
    cc.Name,
    'N/A' AS Status,
    cc.CompanyId AS RelatedId,
    co.CompanyName AS RelatedName,
    GETDATE() AS CreatedDate -- Default to current date if column doesn't exist
FROM dbo.CostCentres cc
JOIN dbo.Company co ON cc.CompanyId = co.Id;
GO

-- Stored procedure for maintaining search history
CREATE OR ALTER PROCEDURE [dbo].[sp_RecordSearchHistory]
    @UserId INT = NULL,
    @Query NVARCHAR(1000),
    @GeneratedSQL NVARCHAR(4000),
    @ResultCount INT,
    @ExecutionTimeMs INT,
    @IP NVARCHAR(50) = NULL,
    @UserAgent NVARCHAR(500) = NULL,
    @Success BIT = 1
AS
BEGIN
    INSERT INTO [dbo].[SearchHistory]
        (UserId, Query, GeneratedSQL, ResultCount, ExecutionTimeMs, SearchDate, IP, UserAgent, Success)
    VALUES
        (@UserId, @Query, @GeneratedSQL, @ResultCount, @ExecutionTimeMs, GETDATE(), @IP, @UserAgent, @Success);
        
    RETURN SCOPE_IDENTITY();
END
GO

-- Stored procedure to get related search suggestions
CREATE OR ALTER PROCEDURE [dbo].[sp_GetSearchSuggestions]
    @Query NVARCHAR(1000),
    @UserId INT = NULL,
    @MaxResults INT = 5
AS
BEGIN
    -- Convert abbreviations to full terms using synonyms table
    DECLARE @ExpandedQuery NVARCHAR(1000) = @Query;
    
    SELECT @ExpandedQuery = REPLACE(@ExpandedQuery, ' ' + Term + ' ', ' ' + Synonym + ' ')
    FROM [dbo].[SearchSynonyms]
    WHERE IsAbbreviation = 1;
    
    -- First, get the user's own recent similar searches
    SELECT TOP (@MaxResults)
        Query AS Suggestion,
        'Recent search' AS Source,
        SearchDate AS RelevanceScore
    FROM [dbo].[SearchHistory]
    WHERE 
        UserId = @UserId 
        AND Query LIKE '%' + @Query + '%'
        AND Success = 1
    ORDER BY SearchDate DESC;
    
    -- Then, get popular successful searches by all users
    SELECT TOP (@MaxResults)
        Query AS Suggestion,
        'Popular search' AS Source,
        COUNT(*) AS RelevanceScore
    FROM [dbo].[SearchHistory]
    WHERE 
        Query LIKE '%' + @Query + '%'
        AND Success = 1
    GROUP BY Query
    ORDER BY COUNT(*) DESC;
    
    -- Finally, get exact synonym matches
    SELECT TOP (@MaxResults)
        Synonym AS Suggestion,
        'Related term' AS Source,
        CASE WHEN IsAbbreviation = 1 THEN 3 ELSE 2 END AS RelevanceScore
    FROM [dbo].[SearchSynonyms]
    WHERE 
        Term LIKE '%' + @Query + '%'
        OR Synonym LIKE '%' + @Query + '%'
    ORDER BY RelevanceScore DESC;
END
GO
