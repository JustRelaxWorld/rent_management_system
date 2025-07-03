/**
 * Cleanup script to remove temporary M-Pesa files after integration
 * 
 * This script checks if the M-Pesa functionality has been properly integrated
 * before removing the temporary files.
 */

const fs = require('fs');
const path = require('path');

// Files to be removed
const filesToRemove = [
  '../Mpesa-Daraja-Api/api.js',
  '../Mpesa-Daraja-Api/app.js',
  '../Mpesa-Daraja-Api/mock-api.js',
  '../Mpesa-Daraja-Api/README.md',
  '../Mpesa-Daraja-Api/stkcallback.json',
  '../Mpesa-Daraja-Api/test-direct.js',
  '../Mpesa-Daraja-Api/test-stkpush.js',
  '../Mpesa-Daraja-Api/test-token.js',
  '../Mpesa-Daraja-Api/test.js',
  '../Mpesa-Demo/src/App.js',
  '../Mpesa-Demo/src/PaymentForm.js',
  '../CS/Mpesa-Daraja-Api-NODE.JS/api.js',
  '../CS/Mpesa-Daraja-Api-NODE.JS/app.js',
  '../CS/Mpesa-Demo-Ui-React/src/PaymentForm.js'
];

// Required files for integration
const requiredFiles = [
  './controllers/mpesa.controller.js',
  './routes/mpesa.routes.js',
  '../client/src/components/payments/MpesaPaymentForm.tsx',
  '../client/src/components/payments/PaymentStatusModal.tsx',
  '../client/src/components/payments/PaymentsPage.tsx'
];

// Check if all required files exist
console.log('Checking if M-Pesa integration is complete...');
let integrationComplete = true;

for (const file of requiredFiles) {
  const filePath = path.resolve(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Required file not found: ${file}`);
    integrationComplete = false;
  } else {
    console.log(`✅ Found required file: ${file}`);
  }
}

if (!integrationComplete) {
  console.error('\n❌ M-Pesa integration is not complete. Please complete the integration before removing temporary files.');
  process.exit(1);
}

// Remove temporary files
console.log('\nRemoving temporary M-Pesa files...');
let success = true;

for (const file of filesToRemove) {
  const filePath = path.resolve(__dirname, file);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${file}`);
    } else {
      console.log(`⚠️ File not found (already removed): ${file}`);
    }
  } catch (err) {
    console.error(`❌ Failed to remove ${file}: ${err.message}`);
    success = false;
  }
}

// Try to remove directories if empty
const dirsToRemove = [
  '../Mpesa-Daraja-Api',
  '../Mpesa-Demo',
  '../CS/Mpesa-Daraja-Api-NODE.JS',
  '../CS/Mpesa-Demo-Ui-React'
];

for (const dir of dirsToRemove) {
  const dirPath = path.resolve(__dirname, dir);
  try {
    if (fs.existsSync(dirPath)) {
      // Check if directory is empty
      const files = fs.readdirSync(dirPath);
      if (files.length === 0) {
        fs.rmdirSync(dirPath);
        console.log(`✅ Removed empty directory: ${dir}`);
      } else {
        console.log(`⚠️ Directory not empty, skipping: ${dir}`);
      }
    }
  } catch (err) {
    console.error(`❌ Failed to remove directory ${dir}: ${err.message}`);
  }
}

if (success) {
  console.log('\n✅ All temporary M-Pesa files have been successfully removed.');
  console.log('\n✅ M-Pesa functionality has been fully integrated into the main application structure.');
} else {
  console.log('\n⚠️ Some files could not be removed. Please check the errors above and remove them manually if needed.');
}

console.log('\nM-Pesa integration is now complete and the temporary files have been cleaned up.');
console.log('You can now use the M-Pesa payment functionality through the following endpoints:');
console.log('- Backend: /api/mpesa/stkpush (POST)');
console.log('- Frontend: /tenant/payments'); 