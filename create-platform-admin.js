#!/usr/bin/env node

/**
 * Simple script to create first platform admin user
 * Generates DynamoDB operations to insert into your database
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
  console.log('This script generates DynamoDB operations to create your first platform admin.\n');

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

    const confirm = await question('\nGenerate DynamoDB operations for this platform admin? (y/N): ');
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Cancelled');
      process.exit(0);
    }

    // Generate DynamoDB operations
    console.log('\n📄 DynamoDB Operations:');
    console.log('========================');
    console.log('Copy and execute these operations in your DynamoDB console or AWS CLI:\n');

    // Organization DynamoDB operation
    console.log('-- 1. Create platform admin organization');
    console.log('AWS CLI Command:');
    console.log(`aws dynamodb put-item \\
  --table-name callflow-organizations \\
  --item '{
    "id": {"S": "${platformOrgId}"},
    "name": {"S": "Platform Administration"},
    "owner_id": {"S": "${clerkUserId}"},
    "plan": {"S": "enterprise"},
    "team_size": {"S": "1-10"},
    "industry": {"S": "Technology"},
    "created_at": {"S": "${timestamp}"},
    "updated_at": {"S": "${timestamp}"}
  }'`);

    console.log('\n-- 2. Create platform admin user');
    console.log('AWS CLI Command:');
    
    const userItem = {
      "id": {"S": userId},
      "email": {"S": email},
      "first_name": {"S": firstName},
      "last_name": {"S": lastName},
      "organization_id": {"S": platformOrgId},
      "role": {"S": "admin"},
      "status": {"S": "active"},
      "clerk_user_id": {"S": clerkUserId},
      "job_title": {"S": jobTitle},
      "department": {"S": department},
      "created_at": {"S": timestamp},
      "updated_at": {"S": timestamp}
    };

    // Add phone number if provided
    if (phoneNumber && phoneNumber.trim()) {
      userItem.phone_number = {"S": phoneNumber.trim()};
    }

    console.log(`aws dynamodb put-item \\
  --table-name callflow-users \\
  --item '${JSON.stringify(userItem, null, 2).replace(/\n/g, '\\n')}'`);

    console.log('\n-- 3. Create email index entry (for email uniqueness)');
    console.log('AWS CLI Command:');
    console.log(`aws dynamodb put-item \\
  --table-name callflow-users \\
  --item '{
    "id": {"S": "email:${email}"},
    "email": {"S": "${email}"},
    "user_id": {"S": "${userId}"},
    "organization_id": {"S": "${platformOrgId}"},
    "created_at": {"S": "${timestamp}"}
  }'`);

    console.log('\n✅ DynamoDB Operations Generated Successfully!');
    console.log('\n📌 Next Steps:');
    console.log('1. Execute the DynamoDB operations above using AWS CLI or DynamoDB console');
    console.log('2. Create the Clerk organization with ID "platform-admin-org"');
    console.log('3. Add your user to the Clerk organization with admin role');
    console.log('4. Login to the admin panel with your Clerk credentials');
    console.log('5. Create additional platform users via the admin UI');
    console.log('\n💡 Platform Admin Powers:');
    console.log('- Create/manage all users (platform and organization)');
    console.log('- Manage SSM Parameter Store');
    console.log('- View system-wide analytics');
    console.log('- Access all admin features');
    console.log('\n🔧 Alternative: Use AWS SDK');
    console.log('If you prefer to use the AWS SDK, here are the JavaScript operations:');
    console.log('\nconst { DynamoDBClient } = require("@aws-sdk/client-dynamodb");');
    console.log('const { PutItemCommand } = require("@aws-sdk/lib-dynamodb");');
    console.log('const client = new DynamoDBClient({ region: "your-region" });');
    console.log('\n// Organization operation');
    console.log('await client.send(new PutItemCommand({');
    console.log('  TableName: "callflow-organizations",');
    console.log('  Item: {');
    console.log(`    id: "${platformOrgId}",`);
    console.log('    name: "Platform Administration",');
    console.log(`    owner_id: "${clerkUserId}",`);
    console.log('    plan: "enterprise",');
    console.log('    team_size: "1-10",');
    console.log('    industry: "Technology",');
    console.log(`    created_at: "${timestamp}",`);
    console.log(`    updated_at: "${timestamp}"`);
    console.log('  }');
    console.log('}));');

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