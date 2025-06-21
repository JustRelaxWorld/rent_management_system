const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// List of test scripts to run in sequence
const testScripts = [
  'test-db-connection.js',
  'test-auth-endpoints.js',
  'test-frontend-integration.js'
];

/**
 * Run a single test script
 * @param {string} script - Script filename
 * @returns {Promise<void>}
 */
async function runScript(script) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`RUNNING TEST: ${script}`);
  console.log(`${'='.repeat(80)}\n`);
  
  try {
    const { stdout, stderr } = await execPromise(`node ${script}`);
    
    if (stdout) {
      console.log(stdout);
    }
    
    if (stderr) {
      console.error('STDERR:', stderr);
    }
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`COMPLETED: ${script}`);
    console.log(`${'='.repeat(80)}\n`);
  } catch (error) {
    console.error(`Error running ${script}:`, error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
  }
}

/**
 * Run all test scripts in sequence
 */
async function runAllTests() {
  console.log('Starting Authentication Integration Tests');
  console.log('========================================\n');
  
  // Display auth improvement recommendations
  console.log('Displaying Authentication Improvement Recommendations:');
  try {
    const { stdout } = await execPromise('node auth-improvements.js');
    console.log(stdout);
  } catch (error) {
    console.error('Error displaying improvement recommendations:', error.message);
  }
  
  // Run each test script in sequence
  for (const script of testScripts) {
    await runScript(script);
  }
  
  console.log('\nAll tests completed!');
  console.log('\nNext steps:');
  console.log('1. Review the test results above');
  console.log('2. Implement the recommended security improvements');
  console.log('3. Create a .env file using the template in env-template.js');
  console.log('4. Update the frontend components to properly handle authentication');
}

// Run all tests
runAllTests().catch(error => {
  console.error('Error in test sequence:', error);
}); 