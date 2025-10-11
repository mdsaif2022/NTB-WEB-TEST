#!/usr/bin/env node

/**
 * Simple Firebase Rules Deployment Script
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Rules Deployment Helper');
console.log('===================================');

// Check if firebase-rules-simple.json exists
const rulesFile = path.join(__dirname, 'firebase-rules-simple.json');
if (!fs.existsSync(rulesFile)) {
  console.error('❌ firebase-rules-simple.json not found!');
  process.exit(1);
}

// Read the rules file
const rules = JSON.parse(fs.readFileSync(rulesFile, 'utf8'));
console.log('✅ Simple rules file found and parsed successfully');

console.log('\n📝 Simple Rules Content:');
console.log('========================');
console.log(JSON.stringify(rules, null, 2));

console.log('\n🚀 Deployment Instructions:');
console.log('============================');
console.log('1. Go to Firebase Console:');
console.log('   https://console.firebase.google.com/project/narayanganj-traveller-bd/database/rules');
console.log('');
console.log('2. Replace the existing rules with:');
console.log('   {');
console.log('     "rules": {');
console.log('       ".read": true,');
console.log('       ".write": true');
console.log('     }');
console.log('   }');
console.log('');
console.log('3. Click "Publish" to deploy the rules');
console.log('');

console.log('⚠️  Important Notes:');
console.log('===================');
console.log('• These rules allow FULL read/write access to ALL data');
console.log('• This is for testing purposes only');
console.log('• DO NOT use these rules in production');
console.log('• After testing, implement proper security rules');
console.log('');

console.log('🔧 Troubleshooting:');
console.log('==================');
console.log('• If rules deployment fails, check Firebase Console');
console.log('• Verify project ID: narayanganj-traveller-bd');
console.log('• Check that Realtime Database is enabled');
console.log('• Test with Firebase Console Rules Playground');
console.log('');

console.log('✅ Script completed successfully!');
