#!/usr/bin/env node

/**
 * Firebase Realtime Database Rules Deployment Script
 * 
 * This script helps deploy Firebase Realtime Database rules to fix permission issues.
 * 
 * Prerequisites:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Login to Firebase: firebase login
 * 3. Initialize Firebase project: firebase init database
 * 
 * Usage:
 * node deploy-firebase-rules.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔥 Firebase Realtime Database Rules Deployment');
console.log('==============================================\n');

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI is installed');
} catch (error) {
  console.error('❌ Firebase CLI is not installed');
  console.log('Please install it with: npm install -g firebase-tools');
  process.exit(1);
}

// Check if rules file exists
const rulesPath = path.join(__dirname, 'firebase-database-rules.json');
if (!fs.existsSync(rulesPath)) {
  console.error('❌ Rules file not found:', rulesPath);
  process.exit(1);
}

console.log('✅ Rules file found:', rulesPath);

// Read and validate rules
try {
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  const rules = JSON.parse(rulesContent);
  
  console.log('✅ Rules file is valid JSON');
  console.log('📋 Rules summary:');
  
  Object.keys(rules.rules).forEach(key => {
    const rule = rules.rules[key];
    if (typeof rule === 'object' && rule !== null) {
      const read = rule['.read'] || 'false';
      const write = rule['.write'] || 'false';
      console.log(`   ${key}: read=${read}, write=${write}`);
    }
  });
  
} catch (error) {
  console.error('❌ Invalid rules file:', error.message);
  process.exit(1);
}

console.log('\n🚀 Deploying rules to Firebase...');

try {
  // Deploy rules
  const output = execSync('firebase deploy --only database', { 
    stdio: 'pipe',
    encoding: 'utf8'
  });
  
  console.log('✅ Rules deployed successfully!');
  console.log('\n📝 Deployment output:');
  console.log(output);
  
  console.log('\n🎉 Firebase Realtime Database rules have been updated!');
  console.log('You can now test the admin panel operations.');
  
} catch (error) {
  console.error('❌ Failed to deploy rules:', error.message);
  
  if (error.message.includes('not logged in')) {
    console.log('\n💡 Please login to Firebase first:');
    console.log('   firebase login');
  } else if (error.message.includes('not initialized')) {
    console.log('\n💡 Please initialize Firebase project first:');
    console.log('   firebase init database');
  } else {
    console.log('\n💡 Manual deployment steps:');
    console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
    console.log('2. Select project: narayanganj-traveller-bd');
    console.log('3. Go to Realtime Database > Rules');
    console.log('4. Copy the content from firebase-database-rules.json');
    console.log('5. Paste and publish the rules');
  }
  
  process.exit(1);
}
