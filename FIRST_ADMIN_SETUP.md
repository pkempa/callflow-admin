# 🔐 First Platform Admin Setup

## Quick Setup (3 Steps)

### 1. Get Your Clerk User ID

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Users**
3. Find your user and copy the **User ID** (starts with `user_`)

### 2. Run the Setup Script

```bash
cd callflow-admin
node create-platform-admin.js
```

**You'll be prompted for:**

- ✅ Clerk User ID
- ✅ Email address
- ✅ First name
- ✅ Last name
- ⚪ Phone number (optional)
- ⚪ Job title (optional)
- ⚪ Department (optional)

### 3. Execute the Generated SQL

The script will output SQL statements like:

```sql
-- 1. Create platform admin organization (if not exists)
INSERT INTO organizations (
  id, name, owner_id, plan, team_size, industry, created_at, updated_at
) VALUES (
  'platform-admin-org',
  'Platform Administration',
  'user_abc123',
  'ENTERPRISE',
  '1-10',
  'Technology',
  '2024-01-01T00:00:00.000Z',
  '2024-01-01T00:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;

-- 2. Create platform admin user
INSERT INTO users (
  id, email, first_name, last_name, organization_id, role, status,
  clerk_user_id, phone_number, job_title, department, created_at, updated_at
) VALUES (
  'user_generated123',
  'admin@yourcompany.com',
  'John',
  'Doe',
  'platform-admin-org',
  'ADMIN',
  'ACTIVE',
  'user_abc123',
  NULL,
  'Platform Administrator',
  'System Administration',
  '2024-01-01T00:00:00.000Z',
  '2024-01-01T00:00:00.000Z'
);
```

Copy and execute these statements in your database.

## ✅ Done!

Now you can:

1. **Login** to the admin panel with your Clerk credentials
2. **Create additional platform users** via the admin UI (`/platform-users`)
3. **Manage the system** with full platform admin access

## 🎯 What You Get

As a **Platform Admin**, you can:

- ✅ Create/manage all platform users (admins & members)
- ✅ Create/manage organization users
- ✅ Manage SSM Parameter Store
- ✅ View system-wide analytics
- ✅ Access all admin features

## 🔄 Creating More Platform Users

After the first admin is set up, create additional platform users through the admin UI:

1. Login to admin panel
2. Go to **Platform Users** page
3. Click **"Create Platform User"**
4. Choose role:
   - **Platform Admin** - Full system access
   - **Platform Member** - Read-only platform access

## 🏗 Default Organization

- **Platform Organization ID:** `platform-admin-org`
- **Organization Name:** "Platform Administration"
- **Purpose:** Houses all platform admins and members
- **Plan:** Enterprise (unlimited features)

This is separate from regular customer organizations.
