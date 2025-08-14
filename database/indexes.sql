-- GEMS AI Search - Recommended Indexes for Performance
-- Run these on your GEMS-UAT database

-- Company table indexes
CREATE NONCLUSTERED INDEX IX_Company_Name_Active 
ON dbo.Company(CompanyName, IsActive) 
INCLUDE (Id);

-- Clients table indexes  
CREATE NONCLUSTERED INDEX IX_Clients_Name 
ON dbo.Clients(Name) 
INCLUDE (Id, CompanyId, ClientStatusId);

CREATE NONCLUSTERED INDEX IX_Clients_Company_Status 
ON dbo.Clients(CompanyId, ClientStatusId) 
INCLUDE (Id, Name);

-- Sites table indexes
CREATE NONCLUSTERED INDEX IX_Sites_ClientId_Name 
ON dbo.Sites(ClientId, Name) 
INCLUDE (Id, SiteNumber);

-- Bookings table indexes
CREATE NONCLUSTERED INDEX IX_Bookings_ClientId_Dates 
ON dbo.Bookings(ClientId, StartDate, EndDate) 
INCLUDE (Id, BookingNumber, BookingStatusId);

CREATE NONCLUSTERED INDEX IX_Bookings_StartDate 
ON dbo.Bookings(StartDate) 
INCLUDE (Id, BookingNumber, ClientId);

-- Candidates table indexes
CREATE NONCLUSTERED INDEX IX_Candidates_Company_Created 
ON dbo.Candidates(CompanyId, CreatedDate) 
INCLUDE (Id, FirstName, Surname, PayrollNumber);

CREATE NONCLUSTERED INDEX IX_Candidates_Names 
ON dbo.Candidates(FirstName, Surname) 
INCLUDE (Id, CompanyId, PayrollNumber);

CREATE NONCLUSTERED INDEX IX_Candidates_PayrollNumber 
ON dbo.Candidates(PayrollNumber) 
WHERE PayrollNumber IS NOT NULL;

-- Timesheets table indexes
CREATE NONCLUSTERED INDEX IX_Timesheets_Client_EndDate 
ON dbo.Timesheets(ClientId, TimesheetEndDate) 
INCLUDE (Id, TimesheetNumber, TotalCharge, TotalPay, StatusId);

CREATE NONCLUSTERED INDEX IX_Timesheets_Status_EndDate 
ON dbo.Timesheets(StatusId, TimesheetEndDate) 
INCLUDE (Id, ClientId, TotalCharge);

CREATE NONCLUSTERED INDEX IX_Timesheets_SubmitDate 
ON dbo.Timesheets(SubmitDate) 
WHERE SubmitDate IS NOT NULL;

-- Requirements table indexes
CREATE NONCLUSTERED INDEX IX_Requirements_BookingId 
ON dbo.Requirements(BookingId) 
INCLUDE (Id, Name, NumberRequested);

-- CostCentres table indexes
CREATE NONCLUSTERED INDEX IX_CostCentres_CompanyId 
ON dbo.CostCentres(CompanyId) 
INCLUDE (Id, Name, Number);

-- Print completion message
PRINT 'GEMS AI Search indexes created successfully!';
PRINT 'These indexes will improve query performance for natural language searches.';