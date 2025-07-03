/**
 * Authentication Issues Diagnostic and Fix Script
 * 
 * This script helps diagnose and fix common authentication issues in the Rent Management System.
 */

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// Constants
const JWT_SECRET = 'rent-management-secret-key';
const JWT_EXPIRE = '30d';

console.log('Authentication Issues Diagnostic and Fix Script');
console.log('==============================================');

// Check if JWT secret is consistent across files
console.log('\n1. Checking JWT secret consistency...');

const filesToCheck = [
  { path: 'middleware/auth.js', variableName: 'JWT_SECRET' },
  { path: 'models/User.js', variableName: 'JWT_SECRET' },
  { path: 'controllers/auth.controller.js', variableName: 'JWT_SECRET' }
];

let hasInconsistentSecrets = false;

filesToCheck.forEach(file => {
  try {
    const filePath = path.join(__dirname, file.path);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Simple check for the JWT secret variable
      const regex = new RegExp(`const\\s+${file.variableName}\\s*=\\s*['"]([^'"]+)['"]`, 'i');
      const match = fileContent.match(regex);
      
      if (match) {
        const secretValue = match[1];
        console.log(`  - ${file.path}: ${file.variableName} = ${secretValue}`);
        
        if (secretValue !== JWT_SECRET) {
          console.log(`    ❌ Secret does not match the expected value: ${JWT_SECRET}`);
          hasInconsistentSecrets = true;
        } else {
          console.log('    ✅ Secret matches the expected value');
        }
      } else {
        console.log(`  - ${file.path}: Could not find ${file.variableName} variable`);
        hasInconsistentSecrets = true;
      }
    } else {
      console.log(`  - ${file.path}: File not found`);
    }
  } catch (error) {
    console.error(`  - Error checking ${file.path}:`, error.message);
  }
});

if (hasInconsistentSecrets) {
  console.log('\n❌ Inconsistent JWT secrets detected. This will cause authentication issues.');
  console.log('   Please make sure all files use the same JWT_SECRET value.');
} else {
  console.log('\n✅ JWT secrets are consistent across all files.');
}

// Check if a token from localStorage can be verified
console.log('\n2. Testing token verification...');
console.log('   Please paste a token from your browser\'s localStorage (or leave empty to skip):');

// In a real interactive script, we would read from stdin here
// For this example, we'll create a sample token
const sampleToken = jwt.sign({ id: 123, role: 'tenant' }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
console.log(`   Sample token for testing: ${sampleToken}`);

try {
  const decoded = jwt.verify(sampleToken, JWT_SECRET);
  console.log('   ✅ Token verification successful!');
  console.log('   Decoded token:', decoded);
} catch (error) {
  console.log(`   ❌ Token verification failed: ${error.message}`);
}

// Provide instructions for fixing common issues
console.log('\n3. Common Authentication Issues and Fixes:');

console.log('\n   a) "Invalid token" or "Not authorized" errors:');
console.log('      - Ensure JWT_SECRET is the same in all files');
console.log('      - Check that the token is properly included in the Authorization header');
console.log('      - Verify the token hasn\'t expired');

console.log('\n   b) Login works but protected routes fail:');
console.log('      - Check the token format in localStorage (should be a valid JWT)');
console.log('      - Ensure the token is being sent with the correct format: "Bearer <token>"');
console.log('      - Look for any CORS issues in the browser console');

console.log('\n   c) Registration works but login fails:');
console.log('      - Verify that passwords are being hashed correctly');
console.log('      - Check if the user exists in the database');
console.log('      - Ensure the email is case-sensitive and matches exactly');

console.log('\n4. Quick Fixes:');
console.log('   a) Clear your browser\'s localStorage and try logging in again');
console.log('   b) Restart the server to ensure all changes take effect');
console.log('   c) Check the server logs for any specific error messages');

console.log('\nDiagnostic complete! If issues persist, please check the server logs for more details.'); 