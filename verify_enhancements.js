// verify_enhancements.js
// Run this script to verify that the enhancements are working correctly

const axios = require('axios');
const readline = require('readline');
const chalk = require('chalk');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';
const TEST_QUERIES = [
  // Basic search tests
  "Show me active clients",
  "Find incomplete timesheets",
  "List bookings on hold",
  "Find requirements with interviews arranged",
  // Abbreviation tests
  "Show me all CC for company ABC",
  "TS awaiting approval",
  // Complex status tests
  "Show me timesheets that are waiting for adjust approval",
  "Find requirements where candidate is considering offer"
];

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Test search functionality
async function testSearch(query) {
  console.log(chalk.blue(`\nTesting query: "${query}"`));
  
  try {
    const startTime = Date.now();
    const response = await axios.post(`${API_BASE_URL}/search`, { query });
    const duration = Date.now() - startTime;
    
    console.log(chalk.green(`✓ Search successful (${duration}ms)`));
    console.log(`Generated SQL: ${chalk.yellow(response.data.sql)}`);
    console.log(`Results: ${chalk.green(response.data.results.length)} items returned`);
    
    // Check for enhanced status values
    const hasEnhancedStatus = response.data.results.some(
      item => Object.keys(item).some(key => key.endsWith('Text'))
    );
    
    if (hasEnhancedStatus) {
      console.log(chalk.green('✓ Enhanced status values detected'));
    } else {
      console.log(chalk.yellow('⚠️ No enhanced status values detected'));
    }
    
    // Show a sample result
    if (response.data.results.length > 0) {
      console.log('Sample result:');
      console.log(JSON.stringify(response.data.results[0], null, 2));
    }
    
    return true;
  } catch (error) {
    console.log(chalk.red(`✗ Search failed: ${error.message}`));
    if (error.response?.data) {
      console.log(chalk.red('Error details:'));
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Test suggestions functionality
async function testSuggestions(query) {
  console.log(chalk.blue(`\nTesting suggestions for: "${query}"`));
  
  try {
    const response = await axios.get(`${API_BASE_URL}/suggestions`, { 
      params: { query }
    });
    
    console.log(chalk.green('✓ Suggestions retrieved successfully'));
    console.log('Suggestions:');
    if (response.data.suggestions && response.data.suggestions.length > 0) {
      response.data.suggestions.forEach((suggestion, i) => {
        console.log(`  ${i+1}. ${chalk.cyan(suggestion.Suggestion || suggestion)}`);
      });
    } else {
      console.log(chalk.yellow('  No suggestions returned'));
    }
    
    return true;
  } catch (error) {
    console.log(chalk.red(`✗ Suggestions failed: ${error.message}`));
    return false;
  }
}

// Main test function
async function runTests() {
  console.log(chalk.blue.bold('=== GEMS AI Search Enhancements Verification ==='));
  console.log(`API URL: ${API_BASE_URL}\n`);
  
  // Test API connection
  console.log(chalk.blue('Testing API connection...'));
  try {
    await axios.get(`${API_BASE_URL}/suggestions`, { params: { query: 'test' } });
    console.log(chalk.green('✓ API connection successful\n'));
  } catch (error) {
    console.log(chalk.red(`✗ API connection failed: ${error.message}`));
    console.log(chalk.yellow('Make sure the backend server is running and the API URL is correct'));
    process.exit(1);
  }
  
  // Run search tests
  console.log(chalk.blue.bold('=== Running Search Tests ==='));
  let searchSuccessCount = 0;
  
  for (const query of TEST_QUERIES) {
    const success = await testSearch(query);
    if (success) searchSuccessCount++;
    
    // Pause between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Run suggestions test
  console.log(chalk.blue.bold('\n=== Running Suggestions Tests ==='));
  let suggestionsSuccessCount = 0;
  
  for (const query of ['client', 'active', 'timesheet']) {
    const success = await testSuggestions(query);
    if (success) suggestionsSuccessCount++;
    
    // Pause between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log(chalk.blue.bold('\n=== Verification Summary ==='));
  console.log(`Search Tests: ${searchSuccessCount}/${TEST_QUERIES.length} passed`);
  console.log(`Suggestions Tests: ${suggestionsSuccessCount}/3 passed`);
  
  if (searchSuccessCount === TEST_QUERIES.length && suggestionsSuccessCount === 3) {
    console.log(chalk.green.bold('\n✓ All tests passed! Enhancements are working correctly.'));
  } else {
    console.log(chalk.yellow.bold('\n⚠️ Some tests failed. Please check the issues above.'));
  }
  
  // Custom query
  rl.question(chalk.blue('\nEnter a custom search query to test (or press Enter to exit): '), async (customQuery) => {
    if (customQuery.trim()) {
      await testSearch(customQuery);
      
      // Show suggestions for this query
      await testSuggestions(customQuery);
    }
    
    rl.close();
    console.log(chalk.blue.bold('\nVerification complete. Thank you for using GEMS AI Search!'));
  });
}

// Run the tests
runTests().catch(error => {
  console.error(chalk.red(`Unhandled error: ${error.message}`));
  process.exit(1);
});
