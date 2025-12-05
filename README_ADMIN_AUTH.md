# Admin Authentication Setup & Testing

## Overview
This admin app uses Supabase authentication with magic link login and role-based access control. Only users with `admin` role in the `profiles` table can access admin pages.

## Prerequisites
- Supabase project set up with tables migrated
- Environment variables configured in `apps/admin/.env`
- Admin user exists in both `auth.users` and `profiles` tables

## Environment Setup

### 1. Install Dependencies
```bash
cd apps/admin
npm install
```

### 2. Configure Environment Variables
Create `apps/admin/.env` with:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Ensure Database is Set Up
Run migrations if needed:
```bash
supabase link --project-ref your-project-id
supabase db push
```

### 4. Create Admin User
If the admin user doesn't exist, create it via Supabase Dashboard or SQL:

```sql
-- Create admin user in profiles table
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ((SELECT id FROM auth.users WHERE email='hello@hmhlabz.com'),'hello@hmhlabz.com','Admin User','admin')
ON CONFLICT (id) DO UPDATE SET role='admin', updated_at=now();
```

## Testing Steps

### 1. Start Development Server
```bash
cd apps/admin
npm run dev
```
Server runs on http://localhost:3001

### 2. Test Email/Password Login
- Open http://localhost:3001/admin/login
- Enter `hello@hmhlabz.com` and password `admin@1234`
- Click "Sign In" to authenticate

### 3. Verify Auth State
- After login, visit http://localhost:3001/admin/_debug/auth
- Expected results:
  - `user.id` matches profile id in database
  - `profile.role` === 'admin'
  - `loading` = false
  - `lastError` = null

### 4. Test Protected Routes
- Visit http://localhost:3001/admin/overview
- Should render admin dashboard (RequireAdmin allows access)

### 5. Test Non-Admin User
- Create a regular user (different email) via Supabase Auth
- Login with that user
- Visit http://localhost:3001/admin/overview
- Should show "Access Denied" message (no redirect loop)

### 6. Test Missing Profile Scenario
- Log in as user who exists in `auth.users` but not in `profiles`
- RequireAdmin should show "Access Pending" UI with Retry button
- Click Retry or refresh profile manually

### 7. Test RLS Blocking
- If profile fetch fails with 500 error, check console for "RLS likely blocks SELECT on profiles"
- Use debug page to inspect `lastError` details

## Manual Test Commands

### Check Profile in Database
```sql
SELECT id, email, role FROM public.profiles WHERE email='hello@hmhlabz.com';
```

### Check Auth User
```sql
SELECT id, email, role FROM auth.users WHERE email='hello@hmhlabz.com';
```

### Debug Profile Fetch Issues
- Open browser dev tools
- Check Network tab for failed requests to Supabase
- Check Console for error messages from AuthContext

## Troubleshooting

### Blank Screen After Login
- Check if `profiles` table exists and has correct RLS policies
- Visit `/admin/_debug/auth` to see auth state
- Check browser console for errors

### Profile Fetch Fails
- Ensure RLS policies allow authenticated users to read their own profile
- Check Supabase project configuration
- Verify environment variables are correct

### Email/Password Login Not Working
- Verify the user exists in both `auth.users` and `profiles` tables
- Check Supabase Auth settings for email confirmation
- Ensure password is correct (default: `admin@1234`)
- Check browser console for authentication errors

### Access Denied for Admin User
- Verify profile.role is exactly 'admin' (case sensitive)
- Check if profile fetch succeeded
- Use debug page to inspect profile data

## Architecture Notes

- AuthContext handles session management and profile fetching
- RequireAdmin provides conditional rendering based on auth state
- Magic link authentication eliminates password management
- Role-based access control via database profile.role field
- Debug page helps troubleshoot auth issues without admin access