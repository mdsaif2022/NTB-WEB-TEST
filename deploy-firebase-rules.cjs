#!/usr/bin/env node

/**
 * Firebase Realtime Database Rules Deployment Script
 * 
 * This script helps deploy Firebase rules to your project.
 * Make sure you have Firebase CLI installed and are logged in.
 * 
 * Usage:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Login: firebase login
 * 3. Run: node deploy-firebase-rules.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Realtime Database Rules Deployment Helper');
console.log('==================================================');

// Check if firebase-database-rules.json exists
const rulesFile = path.join(__dirname, 'firebase-database-rules.json');
if (!fs.existsSync(rulesFile)) {
  console.error('❌ firebase-database-rules.json not found!');
  process.exit(1);
}

// Read the rules file
const rules = JSON.parse(fs.readFileSync(rulesFile, 'utf8'));
console.log('✅ Rules file found and parsed successfully');

// Display the rules structure
console.log('\n📋 Current Rules Structure:');
console.log('==========================');
Object.keys(rules.rules).forEach(path => {
  const rule = rules.rules[path];
  const readAccess = rule['.read'] === true ? '✅ Public' : rule['.read'] || '❌ Denied';
  const writeAccess = rule['.write'] === true ? '✅ Public' : rule['.write'] || '❌ Denied';
  console.log(`📁 ${path}:`);
  console.log(`   Read:  ${readAccess}`);
  console.log(`   Write: ${writeAccess}`);
  if (rule['.indexOn']) {
    console.log(`   Indexes: ${rule['.indexOn'].join(', ')}`);
  }
});

console.log('\n🚀 Deployment Instructions:');
console.log('============================');
console.log('1. Install Firebase CLI (if not installed):');
console.log('   npm install -g firebase-tools');
console.log('');
console.log('2. Login to Firebase:');
console.log('   firebase login');
console.log('');
console.log('3. Initialize Firebase in your project (if not done):');
console.log('   firebase init database');
console.log('');
console.log('4. Deploy the rules:');
console.log('   firebase deploy --only database');
console.log('');
console.log('5. Or copy the rules manually to Firebase Console:');
console.log('   https://console.firebase.google.com/project/narayanganj-traveller-bd/database/rules');
console.log('');

console.log('📝 Rules Content (copy to Firebase Console):');
console.log('============================================');
console.log(JSON.stringify(rules, null, 2));

console.log('\n⚠️  Important Notes:');
console.log('===================');
console.log('• These rules allow public read/write access for development');
console.log('• For production, implement proper authentication rules');
console.log('• Make sure your Firebase project ID is: narayanganj-traveller-bd');
console.log('• Database URL should be: https://narayanganj-traveller-bd-default-rtdb.firebaseio.com');
console.log('');

console.log('🔧 Troubleshooting:');
console.log('==================');
console.log('• If rules deployment fails, check Firebase CLI login status');
console.log('• Verify project ID matches your Firebase project');
console.log('• Check Firebase Console for any error messages');
console.log('• Test rules using Firebase Console Rules Playground');
console.log('');

console.log('✅ Script completed successfully!');