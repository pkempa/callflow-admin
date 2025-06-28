# CallFlowHQ Admin Panel Setup Guide

## 🔐 Authentication Flow

The admin panel uses a **dual authentication system**:

1. **Clerk** (Frontend Authentication) - Handles login/logout, session management
2. **CallFlowHQ Database** (Backend Authorization) - Stores user roles and permissions

### How It Works:

```
User Login → Clerk Auth → Get JWT Token → Send to Backend →
Backend verifies with Clerk → Looks up user in CallFlow DB →
Returns user role & permissions
```

## 🚀 First Admin Setup (Automatic)

### **New: Auto-Setup System**

When you log into the admin panel for the first time, the system automatically:

1. ✅ Detects you're authenticated with Clerk but don't exist in CallFlow database
2. ✅ Calls `/admin/setup-first-user` endpoint automatically
3. ✅ Creates your user record as a **Platform Admin**
4. ✅ Creates the "Platform Administration" organization
5. ✅ Allows you to access all admin features

### **What You Need to Do:**

1. **Create Clerk User** (if not already done):

   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Navigate to **Users** → **Create user**
   - Fill in your details and create the user

2. **Login to Admin Panel**:

   - Go to your admin panel URL (e.g., `http://localhost:3001`)
   - Sign in with your Clerk credentials
   - The system will automatically create your admin user

3. **That's it!** 🎉

## 🛠 Manual Setup (if auto-setup fails)

If the automatic setup doesn't work, you can create the first admin manually:

### Option 1: Using the Platform User API

```bash
# 1. Get your Clerk JWT token by logging into the admin panel
# 2. Check browser developer tools → Network tab → Copy Authorization header

curl -X POST https://your-backend-url/admin/setup-first-user \
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "setup_key": "admin-first-setup-2024"
  }'
```

### Option 2: Using the Platform User Creation API

```bash
curl -X POST https://your-backend-url/admin/platform-users \
  -H "Authorization: Bearer YOUR_PLATFORM_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "first_name": "Admin",
    "last_name": "User",
    "role": "platform_admin",
    "clerk_user_id": "your_clerk_user_id",
    "send_invitation": false
  }'
```

## 🔑 User Roles Explained

### **Platform Admin** 🔴

- **Full system control**
- Create/manage all users (platform and organization)
- Manage SSM Parameter Store
- View system-wide analytics
- Access all admin features

### **Platform Member** 🔵

- **Read-only platform access**
- View system analytics
- View SSM parameters (cannot modify)
- View organizations and users
- Cannot create/modify/delete anything

### **Organization Admin** 🟡

- **Organization-specific admin**
- Manage users in their organization only
- View org-specific analytics
- Cannot access platform features

### **Member** ⚪

- **Regular user**
- Use application features
- View their own profile
- No admin access

## 🏗 Backend Endpoints

### Authentication Endpoints:

- `POST /admin/setup-first-user` - Auto-create first admin
- `GET /admin/analytics` - System analytics
- `GET /admin/organizations` - List organizations
- `GET /admin/users` - List organization users

### Platform User Management:

- `POST /admin/platform-users` - Create platform users
- `GET /admin/platform-users` - List all platform users
- `PUT /admin/platform-users/{id}` - Update platform user
- `DELETE /admin/platform-users/{id}` - Delete platform user

### Parameter Management:

- `GET /admin/parameters` - List SSM parameters
- `POST /admin/parameters` - Create parameter
- `PUT /admin/parameters/{name}` - Update parameter
- `DELETE /admin/parameters/{name}` - Delete parameter

## 🔧 Troubleshooting

### "Authentication failed" errors:

1. **Check Clerk Setup**:

   - Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.local`
   - Verify `CLERK_SECRET_KEY` in backend environment

2. **Check User Exists**:

   - User must exist in both Clerk AND CallFlow database
   - Auto-setup should handle this automatically

3. **Check API URLs**:
   - Verify `NEXT_PUBLIC_API_URL` points to your backend
   - Ensure CORS is properly configured

### Auto-setup not working:

1. **Check browser console** for setup logs
2. **Check backend logs** for auth errors
3. **Manually call setup endpoint** using curl/Postman
4. **Verify Clerk user ID** matches in both systems

### Missing permissions:

1. **Check user role** in database
2. **Verify organization assignment** (Platform Admin = "platform-admin-org")
3. **Check auth decorator** on backend endpoints

## 🔍 Debug Commands

```bash
# Check if user exists in database
curl -X GET https://your-backend-url/admin/platform-users \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test authentication
curl -X GET https://your-backend-url/admin/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"

# Force setup first user
curl -X POST https://your-backend-url/admin/setup-first-user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📞 Need Help?

If you're still having issues:

1. Check the browser console for detailed error logs
2. Check your backend logs for authentication errors
3. Verify your Clerk configuration
4. Ensure your database is properly connected

The auto-setup system should handle 99% of cases automatically! 🎯
