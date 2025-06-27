# First Admin User Setup Guide

This guide explains how to create the very first administrator user for your CallFlowHQ Admin Panel.

## 🔒 Security Note

The admin panel uses **invitation-only registration** for security. Self-registration is disabled to prevent unauthorized access.

## Prerequisites: Environment Setup

**You need to create a `.env.local` file first:**

1. **Create the file** in the `callflow-admin` directory:

   ```bash
   cd callflow-admin
   touch .env.local
   ```

2. **Add the following content** to `.env.local`:

   ```bash
   # Clerk Authentication - REPLACE WITH YOUR ACTUAL KEYS
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   CLERK_SECRET_KEY=sk_test_your_secret_key_here

   # Clerk URLs (for admin app on port 3001)
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

   # First Admin Setup - GENERATE A SECURE KEY
   ADMIN_SETUP_KEY=generate_a_secure_key_here
   ```

3. **Get your Clerk keys**:

   - Go to https://dashboard.clerk.com
   - Select your project (or create a new one for the admin app)
   - Go to "API Keys" in the sidebar
   - Copy the "Publishable key" and "Secret key"
   - Replace the placeholder values in `.env.local`

4. **Generate a setup key** (for Option 2 below):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Replace `generate_a_secure_key_here` with the generated key.

## Option 1: Using Clerk Dashboard (Recommended)

This is the easiest and most secure method:

### Steps:

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com
2. **Sign in** to your Clerk account
3. **Select your CallFlowHQ Admin application**
4. **Navigate to "Users"** in the left sidebar
5. **Click "Create user"**
6. **Fill in the admin details**:
   - Email address
   - Password (or leave empty to send invitation)
   - First name
   - Last name
7. **Click "Create"**

The user will be automatically verified and can immediately sign in to the admin panel.

## Option 2: Using the Setup API Endpoint

If you prefer a programmatic approach:

### Prerequisites:

- Admin application running locally
- Access to environment variables

### Steps:

1. **Run the setup helper script**:

   ```bash
   cd callflow-admin
   node setup-first-admin.js
   ```

2. **Follow the prompts** to enter:

   - First Name
   - Last Name
   - Email Address
   - Password (hidden input)
   - Confirm Password

3. **The script will generate a setup key** - add it to your `.env.local` file:

   ```bash
   ADMIN_SETUP_KEY=your_generated_key_here
   ```

4. **Start the admin application**:

   ```bash
   npm run dev
   ```

5. **Make the API call** (the script will show you the exact curl command):
   ```bash
   curl -X POST http://localhost:3001/api/setup-admin \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "your-secure-password",
       "firstName": "Admin",
       "lastName": "User",
       "setupKey": "your_generated_key_here"
     }'
   ```

### Security Features:

- ✅ Setup key prevents unauthorized user creation
- ✅ API endpoint only works when no users exist
- ✅ One-time use only (disabled after first user is created)
- ✅ Validates password strength requirements

## Option 3: Manual Environment Setup

If you need to create the first user without the helper script:

1. **Generate a secure setup key**:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Add to `.env.local`**:

   ```bash
   ADMIN_SETUP_KEY=your_generated_key
   ```

3. **Use the API endpoint** with your preferred HTTP client (curl, Postman, etc.)

## Verification

After creating the first admin user:

1. **Visit the admin panel**: http://localhost:3001
2. **Sign in** with the created credentials
3. **Verify access** to all admin features
4. **Check the user dropdown** shows admin role

## Next Steps: Inviting Additional Admins

Once you have the first admin user, you can invite additional administrators:

### Current Options:

1. **Clerk Dashboard**: Create additional users manually
2. **Future Feature**: Admin panel will include user invitation system

### Planned Features:

- 📧 Email invitation system
- 👥 Role-based permissions
- 🔐 Temporary invitation links
- ⏰ Invitation expiration

## Troubleshooting

### Common Issues:

**"Missing environment variables" error**

- Ensure `.env.local` file exists in `callflow-admin` directory
- Verify all required variables are set
- Check that Clerk keys are valid

**"Invalid setup key" error**

- Ensure `ADMIN_SETUP_KEY` is set in `.env.local`
