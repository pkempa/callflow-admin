#!/usr/bin/env node

/**
 * Script to create the first platform admin user
 * Run this once to bootstrap your admin system
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🔐 CallFlowHQ - Create First Platform Admin');
  console.log('==========================================');
  console.log('This script helps you create the first platform administrator.\n');

  try {
    // Get Clerk user info
    const clerkUserId = await question('Clerk User ID (from Clerk dashboard): ');
    const email = await question('Email Address: ');
    const firstName = await question('First Name: ');
    const lastName = await question('Last Name: ');

    console.log('\n📋 User Information:');
    console.log('===================');
    console.log(`Clerk User ID: ${clerkUserId}`);
    console.log(`Name: ${firstName} ${lastName}`);
    console.log(`Email: ${email}`);

    const confirm = await question('\nCreate this platform admin? (y/N): ');
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Cancelled');
      process.exit(0);
    }

    // Generate SQL/API call instructions
    console.log('\n🔧 Database Setup Instructions:');
    console.log('===============================');
    
    console.log('1. Execute this SQL in your database:');
    console.log(`
-- Create platform admin organization
INSERT INTO organizations (id, name, owner_id, plan, team_size, industry, created_at, updated_at)
VALUES (
  'platform-admin-org',
  'Platform Administration', 
  '${clerkUserId}',
  'ENTERPRISE',
  '1-10',
  'Technology',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create platform admin user  
INSERT INTO users (id, email, first_name, last_name, organization_id, role, status, clerk_user_id, job_title, department, created_at, updated_at)
VALUES (
  'platform-admin-${Date.now()}',
  '${email}',
  '${firstName}',
  '${lastName}',
  'platform-admin-org',
  'ADMIN',
  'ACTIVE', 
  '${clerkUserId}',
  'Platform Administrator',
  'System Administration',
  NOW(),
  NOW()
);`);

    console.log('\n2. Alternative: Use API call:');
    console.log(`
curl -X POST https://your-backend-url/admin/platform-users \\
  -H "Authorization: Bearer YOUR_EXISTING_ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "${email}",
    "first_name": "${firstName}",
    "last_name": "${lastName}",
    "role": "platform_admin",
    "clerk_user_id": "${clerkUserId}",
    "send_invitation": false
  }'`);

    console.log('\n✅ Instructions generated!');
    console.log('\n📌 Next Steps:');
    console.log('1. Execute the SQL above in your database');
    console.log('2. Login to the admin panel with your Clerk credentials');
    console.log('3. You can now create additional platform users via the UI');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main(); 