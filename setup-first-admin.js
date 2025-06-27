#!/usr/bin/env node

/**
 * Setup script for creating the first admin user
 * Run this script to create the initial administrator account
 */

const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function questionHidden(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    
    process.stdin.on('data', function(char) {
      char = char + '';
      
      switch(char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function main() {
  console.log('🔐 CallFlowHQ Admin Setup');
  console.log('========================');
  console.log('This script will help you create the first admin user.\n');

  try {
    // Check if we're in the right directory
    const fs = require('fs');
    if (!fs.existsSync('./package.json')) {
      console.error('❌ Error: Please run this script from the callflow-admin directory');
      process.exit(1);
    }

    // Get user input
    const firstName = await question('First Name: ');
    const lastName = await question('Last Name: ');
    const email = await question('Email Address: ');
    const password = await questionHidden('Password: ');
    const confirmPassword = await questionHidden('Confirm Password: ');

    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match!');
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters long!');
      process.exit(1);
    }

    // Generate a secure setup key
    const setupKey = crypto.randomBytes(32).toString('hex');

    console.log('\n📋 Setup Information:');
    console.log('====================');
    console.log(`Name: ${firstName} ${lastName}`);
    console.log(`Email: ${email}`);
    console.log(`Setup Key: ${setupKey}`);

    console.log('\n🔧 Next Steps:');
    console.log('==============');
    console.log('1. Add this environment variable to your .env.local file:');
    console.log(`   ADMIN_SETUP_KEY=${setupKey}`);
    console.log('\n2. Start your admin application:');
    console.log('   npm run dev');
    console.log('\n3. Make a POST request to create the admin user:');
    console.log('   curl -X POST http://localhost:3001/api/setup-admin \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{\n' +
      `       "email": "${email}",\n` +
      `       "password": "${password}",\n` +
      `       "firstName": "${firstName}",\n` +
      `       "lastName": "${lastName}",\n` +
      `       "setupKey": "${setupKey}"\n` +
      '     }\'');

    console.log('\n📝 Alternative: Use Clerk Dashboard');
    console.log('===================================');
    console.log('You can also create the first user directly in the Clerk Dashboard:');
    console.log('1. Go to https://dashboard.clerk.com');
    console.log('2. Navigate to Users → Create user');
    console.log('3. Fill in the user details and click Create');

    console.log('\n✅ Setup information generated successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main(); 