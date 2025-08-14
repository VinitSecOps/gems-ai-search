// File: d:\Matriks Projects\gems-ai-search\backend\src\services\statusMappingService.js
import winston from 'winston';
import { getEnumValueFromText } from './enumMappingService.js';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/nlp.log' })
  ]
});

// Maps for common status terms to their respective enum values - EXACT VALUES PER SPEC
const timesheetStatusMap = {
  // Precise enum values as specified in documentation
  'incomplete': 1,                // 1: Incomplete
  'partially complete': 2,        // 2: PartiallyComplete
  'partially incomplete': 2,      // 2: PartiallyComplete (alternate term)
  'complete': 3,                  // 3: Complete
  'approved': 4,                  // 4: Approved
  'submitted': 5,                 // 5: Submitted - THIS IS THE SUBMITTED STATUS
  'processed': 5,                 // 5: Submitted (alternate term)
  'rejected': 6,                  // 6: Rejected
  'waiting for adjust approval': 7, // 7: WaitingForAdjustApproval
  'awaiting adjust approval': 7,  // 7: WaitingForAdjustApproval (alternate term)
  'awaiting pacs processing': 8,  // 8: AwaitingPACSProcessing
  'awaiting pacs': 8,             // 8: AwaitingPACSProcessing (alternate term)
  'template payroll timesheets': 10, // 10: TemplatePayrollTimesheets
  'template': 10,                 // 10: TemplatePayrollTimesheets (alternate term)
  'payroll template': 10,         // 10: TemplatePayrollTimesheets (alternate term)
  'candidate sds notification awaiting review': 11, // 11: CandidateSDSNotificationAwaitingReview
  'awaiting sds': 11,             // 11: CandidateSDSNotificationAwaitingReview (alternate term)
  'awaiting ir35': 11,            // 11: CandidateSDSNotificationAwaitingReview (alternate term)
  'awaiting review': 11,          // 11: CandidateSDSNotificationAwaitingReview (alternate term)
  'sent for authorization': 12,   // 12: SentForAuthorization
  'sent for approval': 12,        // 12: SentForAuthorization (alternate term)
  // Additional combination terms - only used for specific multi-status situations
  'awaiting approval': [1, 2, 3, 6], // Multiple possible status values for this generic term
};

const bookingStatusMap = {
  'inactive': 1,
  'active': 2,
  'archived': 3,
  'on hold': 4
};

const clientStatusMap = {
  'inactive': 1,
  'active': 2,
  'archived': 3,
  'on hold': 4
};

const requirementCVStatusMap = {
  'shortlisted': 1,
  'cv shortlisted': 1,
  'reviewing': 3,
  'client reviewing': 3,
  'interview requested': 4,
  'interview arranged': 5,
  'considering': 6,
  'candidate considering': 6,
  'interview conducted': 6,
  'offer made': 7,
  'offer accepted': 8,
  'successful': 8,
  'rejected': 9,
  'filled': 10,
  'no show': 11,
  'unsuccessful': 12
};

// Function to recognize status terms in natural language and convert to SQL conditions
export const recognizeStatusTerms = async (query) => {
  const lowerQuery = query.toLowerCase();
  const recognized = [];
  
  // Check for timesheet status terms
  for (const [term, value] of Object.entries(timesheetStatusMap)) {
    if (lowerQuery.includes(term)) {
      if (Array.isArray(value)) {
        recognized.push({
          entity: 'Timesheets',
          column: 'StatusId',
          condition: `StatusId IN (${value.join(', ')})`,
          originalTerm: term
        });
      } else {
        recognized.push({
          entity: 'Timesheets',
          column: 'StatusId',
          condition: `StatusId = ${value}`,
          originalTerm: term
        });
      }
    }
  }
  
  // Check for booking status terms
  for (const [term, value] of Object.entries(bookingStatusMap)) {
    // Only match if "booking" and the term are close together
    const bookingTermRegex = new RegExp(`(booking|bookings).{0,20}${term}|${term}.{0,20}(booking|bookings)`, 'i');
    if (bookingTermRegex.test(lowerQuery)) {
      recognized.push({
        entity: 'Bookings',
        column: 'WorkStatusId',
        condition: `WorkStatusId = ${value}`,
        originalTerm: term
      });
    }
  }
  
  // Check for client status terms
  for (const [term, value] of Object.entries(clientStatusMap)) {
    // Only match if "client" and the term are close together
    const clientTermRegex = new RegExp(`(client|clients).{0,20}${term}|${term}.{0,20}(client|clients)`, 'i');
    if (clientTermRegex.test(lowerQuery)) {
      recognized.push({
        entity: 'Clients',
        column: 'ClientStatusId',
        condition: `ClientStatusId = ${value}`,
        originalTerm: term
      });
    }
  }
  
  // Check for requirement CV workflow status terms
  for (const [term, value] of Object.entries(requirementCVStatusMap)) {
    // Only match if "requirement" and the term are close together
    const reqTermRegex = new RegExp(`(requirement|requirements|cv).{0,25}${term}|${term}.{0,25}(requirement|requirements|cv)`, 'i');
    if (reqTermRegex.test(lowerQuery)) {
      recognized.push({
        entity: 'Requirements',
        column: 'CVWorkflowStatusId',
        condition: `CVWorkflowStatusId = ${value}`,
        originalTerm: term
      });
    }
  }
  
  // Log what we found
  if (recognized.length > 0) {
    logger.info('Recognized status terms:', { query, recognized });
  }
  
  return recognized;
};

// Function to enhance the NLP context with status information
export const enhanceNlpContextWithStatuses = async (query) => {
  const recognizedStatuses = await recognizeStatusTerms(query);
  
  if (recognizedStatuses.length === 0) {
    return null;
  }
  
  let context = "I've detected the following status terms in your query:\n\n";
  
  for (const status of recognizedStatuses) {
    context += `- Term "${status.originalTerm}" maps to ${status.entity}.${status.column} with condition: ${status.condition}\n`;
  }
  
  context += "\nI'll use these mappings to ensure the correct status values are used in the SQL query.";
  
  return context;
};
