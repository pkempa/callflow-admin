#!/usr/bin/env node

/**
 * Simple script to create first platform admin user
 * Generates SQL statements to insert into your database
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

function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

async function main() {
  console.log('🔐 Create First Platform Admin');
  console.log('=============================');
  console.log('This script generates SQL to create your first platform admin.\n');

  try {
    // Get required information
    const clerkUserId = await question('Clerk User ID (from Clerk dashboard): ');
    const email = await question('Email: ');
    const firstName = await question('First Name: ');
    const lastName = await question('Last Name: ');
    
    // Optional fields
    const phoneNumber = await question('Phone Number (optional): ');
    const jobTitle = await question('Job Title (default: Platform Administrator): ') || 'Platform Administrator';
    const department = await question('Department (default: System Administration): ') || 'System Administration';

    // Generate IDs
    const userId = `user_${generateId()}`;
    const platformOrgId = 'platform-admin-org';
    const timestamp = new Date().toISOString();

    console.log('\n📋 Summary:');
    console.log('============');
    console.log(`Clerk User ID: ${clerkUserId}`);
    console.log(`Email: ${email}`);
    console.log(`Name: ${firstName} ${lastName}`);
    console.log(`Role: Platform Administrator`);
    console.log(`Organization: Platform Administration (${platformOrgId})`);

    const confirm = await question('\nGenerate SQL for this platform admin? (y/N): ');
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Cancelled');
      process.exit(0);
    }

    // Generate SQL statements
    console.log('\n📄 SQL Statements:');
    console.log('==================');
    console.log('Copy and execute these SQL statements in your database:\n');

    // Organization SQL (with conflict handling)
    console.log('-- 1. Create platform admin organization (if not exists)');
    console.log(`INSERT INTO organizations (
  id,
  name,
  owner_id,
  plan,
  team_size,
  industry,
  created_at,
  updated_at
) VALUES (
  '${platformOrgId}',
  'Platform Administration',
  '${clerkUserId}',
  'ENTERPRISE',
  '1-10',
  'Technology',
  '${timestamp}',
  '${timestamp}'
) ON CONFLICT (id) DO NOTHING;`);

    console.log('\n-- 2. Create platform admin user');
    console.log(`INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  organization_id,
  role,
  status,
  clerk_user_id,
  phone_number,
  job_title,
  department,
  created_at,
  updated_at
) VALUES (
  '${userId}',
  '${email}',
  '${firstName}',
  '${lastName}',
  '${platformOrgId}',
  'ADMIN',
  'ACTIVE',
  '${clerkUserId}',
  ${phoneNumber ? `'${phoneNumber}'` : 'NULL'},
  '${jobTitle}',
  '${department}',
  '${timestamp}',
  '${timestamp}'
);`);

    console.log('\n✅ SQL Generated Successfully!');
    console.log('\n📌 Next Steps:');
    console.log('1. Execute the SQL statements above in your database');
    console.log('2. Login to the admin panel with your Clerk credentials');
    console.log('3. Create additional platform users via the admin UI');
    console.log('\n💡 Platform Admin Powers:');
    console.log('- Create/manage all users (platform and organization)');
    console.log('- Manage SSM Parameter Store');
    console.log('- View system-wide analytics');
    console.log('- Access all admin features');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n❌ Cancelled by user');
  rl.close();
  process.exit(0);
});

main(); 