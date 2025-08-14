-- GEMS AI Search - Enum Mappings
-- Created based on actual GEMS system enum values
USE [GEMS-UAT]
GO

-- Clear existing mappings before inserting new ones
DELETE FROM [dbo].[EnumMappings];
GO

-- Timesheet StatusId mappings
INSERT INTO [dbo].[EnumMappings] ([TableName], [ColumnName], [Value], [DisplayText], [Description])
VALUES
('Timesheets', 'StatusId', 1, 'Incomplete', 'Awaiting Approval - Incomplete'),
('Timesheets', 'StatusId', 2, 'Partially Complete', 'Awaiting Approval - Partially Incomplete'),
('Timesheets', 'StatusId', 3, 'Complete', 'Awaiting Approval - Complete'),
('Timesheets', 'StatusId', 4, 'Approved', 'Approved - Ready to Submit'),
('Timesheets', 'StatusId', 5, 'Submitted', 'Submitted - Processed'),
('Timesheets', 'StatusId', 6, 'Rejected', 'Awaiting Approval - Rejected'),
('Timesheets', 'StatusId', 7, 'Waiting for Adjust Approval', 'Submitted - Awaiting Adjust Approval'),
('Timesheets', 'StatusId', 8, 'Awaiting PACS Processing', 'Submitted - Awaiting PACS Processing'),
('Timesheets', 'StatusId', 10, 'Template Payroll Timesheet', 'Payroll Timesheet Template'),
('Timesheets', 'StatusId', 11, 'Awaiting SDS IR35 Review', 'Awaiting SDS IR35 Notification Review'),
('Timesheets', 'StatusId', 12, 'Sent For Approval', 'Sent For Authorization');
GO

-- Requirement CV Workflow StatusId mappings
INSERT INTO [dbo].[EnumMappings] ([TableName], [ColumnName], [Value], [DisplayText], [Description])
VALUES
('Requirements', 'CVWorkflowStatusId', 1, 'CV Shortlisted', 'CV - Shortlisted'),
('Requirements', 'CVWorkflowStatusId', 3, 'Client Reviewing', 'Client - Reviewing'),
('Requirements', 'CVWorkflowStatusId', 4, 'Interview Requested', 'Interview - Requested'),
('Requirements', 'CVWorkflowStatusId', 5, 'Interview Arranged', 'Interview - Arranged'),
('Requirements', 'CVWorkflowStatusId', 6, 'Candidate Considering', 'Interview Conducted'),
('Requirements', 'CVWorkflowStatusId', 7, 'Offer Made', 'Offer Made'),
('Requirements', 'CVWorkflowStatusId', 8, 'Offer Accepted', 'Successful – Offer Accepted'),
('Requirements', 'CVWorkflowStatusId', 9, 'Rejected', 'Rejected'),
('Requirements', 'CVWorkflowStatusId', 10, 'Filled', 'Filled'),
('Requirements', 'CVWorkflowStatusId', 11, 'No Show', 'No Show'),
('Requirements', 'CVWorkflowStatusId', 12, 'Unsuccessful', 'Unsuccessful');
GO

-- Booking Work StatusId mappings
INSERT INTO [dbo].[EnumMappings] ([TableName], [ColumnName], [Value], [DisplayText], [Description])
VALUES
('Bookings', 'WorkStatusId', 1, 'Inactive', 'Inactive booking'),
('Bookings', 'WorkStatusId', 2, 'Active', 'Active booking'),
('Bookings', 'WorkStatusId', 3, 'Archived', 'Archived booking'),
('Bookings', 'WorkStatusId', 4, 'On Hold', 'Booking on hold');
GO

-- Client Status mappings
INSERT INTO [dbo].[EnumMappings] ([TableName], [ColumnName], [Value], [DisplayText], [Description])
VALUES
('Clients', 'ClientStatusId', 1, 'Inactive', 'Client is inactive'),
('Clients', 'ClientStatusId', 2, 'Active', 'Client is active'),
('Clients', 'ClientStatusId', 3, 'Archived', 'Client is archived'),
('Clients', 'ClientStatusId', 4, 'On Hold', 'Client is on hold');
GO

-- Permanent Invoice Status mappings
INSERT INTO [dbo].[EnumMappings] ([TableName], [ColumnName], [Value], [DisplayText], [Description])
VALUES
('PermInvoices', 'StatusId', 0, 'Not Generated', 'Permanent invoice not generated'),
('PermInvoices', 'StatusId', 1, 'Generated', 'Permanent invoice generated'),
('PermInvoices', 'StatusId', 2, 'Needs Regeneration', 'Permanent invoice should be regenerated');
GO

-- Pension Status Types
INSERT INTO [dbo].[EnumMappings] ([TableName], [ColumnName], [Value], [DisplayText], [Description])
VALUES
('CandidatePensions', 'PensionStatusTypeId', 0, 'Enrolled', 'Candidate is enrolled in pension'),
('CandidatePensions', 'PensionStatusTypeId', 1, 'Opted Out', 'Candidate has opted out of pension'),
('CandidatePensions', 'PensionStatusTypeId', 2, 'Not Enrolled', 'Candidate is not enrolled in pension'),
('CandidatePensions', 'PensionStatusTypeId', 3, 'Postponed', 'Candidate pension enrollment is postponed');
GO

-- Migration Result Status
INSERT INTO [dbo].[EnumMappings] ([TableName], [ColumnName], [Value], [DisplayText], [Description])
VALUES
('MigrationResults', 'StatusId', 0, 'Waiting', 'Waiting for migration'),
('MigrationResults', 'StatusId', 1, 'Success', 'Migration successful'),
('MigrationResults', 'StatusId', 2, 'Failed', 'Migration failed');
GO

-- Remove Requirement Status
INSERT INTO [dbo].[EnumMappings] ([TableName], [ColumnName], [Value], [DisplayText], [Description])
VALUES
('Requirements', 'RemoveRequirementStatusId', 1, 'Can Remove', 'Requirement can be removed'),
('Requirements', 'RemoveRequirementStatusId', 2, 'Outstanding Invoices', 'Outstanding permanent invoices exist'),
('Requirements', 'RemoveRequirementStatusId', 3, 'Cannot Remove', 'Requirement cannot be removed');
GO

-- Reminder Status
INSERT INTO [dbo].[EnumMappings] ([TableName], [ColumnName], [Value], [DisplayText], [Description])
VALUES
('Reminders', 'StatusId', 0, 'New', 'New reminder'),
('Reminders', 'StatusId', 1, 'Handled', 'Reminder has been handled'),
('Reminders', 'StatusId', 2, 'Complete', 'Reminder is complete'),
('Reminders', 'StatusId', 4, 'Archived', 'Reminder is archived');
GO

-- CIS Pay Status
INSERT INTO [dbo].[EnumMappings] ([TableName], [ColumnName], [Value], [DisplayText], [Description])
VALUES
('CISPayments', 'StatusId', 1, 'Standard Rate 20%', 'CIS Standard Rate 20%'),
('CISPayments', 'StatusId', 2, 'Higher Rate 30%', 'CIS Higher Rate 30%'),
('CISPayments', 'StatusId', 3, 'Gross', 'CIS Gross payment');
GO

-- Role Mappings
INSERT INTO [dbo].[EnumMappings] ([TableName], [ColumnName], [Value], [DisplayText], [Description])
VALUES
('Users', 'RoleId', 1, 'Agency User', 'Agency standard user'),
('Users', 'RoleId', 2, 'Agency Administrator', 'Agency administrator user'),
('Users', 'RoleId', 3, 'Simplicity Administrator', 'Simplicity administrator'),
('Users', 'RoleId', 4, 'Blueberry Administrator', 'Blueberry administrator'),
('Users', 'RoleId', 5, 'Client Basic User', 'Client user with basic access'),
('Users', 'RoleId', 6, 'Client Timesheet User', 'Client user with timesheet access'),
('Users', 'RoleId', 7, 'Client Super User', 'Client user with super access'),
('Users', 'RoleId', 8, 'Candidate User', 'Candidate user');
GO

-- User Types
INSERT INTO [dbo].[EnumMappings] ([TableName], [ColumnName], [Value], [DisplayText], [Description])
VALUES
('Users', 'UserTypeId', 1, 'Blueberry Admin', 'BB Admin user'),
('Users', 'UserTypeId', 2, 'Simplicity Admin', 'SM Admin user'),
('Users', 'UserTypeId', 3, 'Agency Admin', 'Agency administrator'),
('Users', 'UserTypeId', 4, 'Agency User', 'Agency standard user'),
('Users', 'UserTypeId', 5, 'Candidate', 'Candidate user'),
('Users', 'UserTypeId', 6, 'Client', 'Client user');
GO

-- System Message Status
INSERT INTO [dbo].[EnumMappings] ([TableName], [ColumnName], [Value], [DisplayText], [Description])
VALUES
('SystemMessages', 'StatusId', 1, 'Unread', 'Message is unread'),
('SystemMessages', 'StatusId', 2, 'Read', 'Message has been read');
GO
