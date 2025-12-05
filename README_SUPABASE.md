# 🔄 Supabase Setup & Configuration

## 🏗️ Remote-Only Development Approach

**Important**: This project uses **remote Supabase projects only**. We do NOT use local Supabase containers or `supabase start`. All environments (local development, staging, production) connect to live Supabase projects.

### Remote-Only Benefits
- ✅ **Real Data**: Work with actual database state
- ✅ **Storage Integration**: Live file uploads/downloads
- ✅ **Auth Integration**: Real user authentication
- ✅ **Edge Functions**: Deploy and test serverless functions
- ✅ **No Synchronization**: Avoid local/remote discrepancies

## 📋 Project Creation Per Environment

Create separate Supabase projects for each environment:
- **Development**: `https://your-dev-project.supabase.co`
- **Staging**: `https://your-staging-project.supabase.co`
- **Production**: `https://your-prod-project.supabase.co`

### Creating a New Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Choose your organization
4. Set project name (e.g., `credits-dev`, `credits-prod`)
5. Choose database password (save securely)
6. Wait for project initialization

## 🔗 CLI Connection & Setup

### Link to Remote Project
```bash
# Authenticate CLI (one-time)
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Verify connection
supabase status
```

### Environment Configuration
Copy `.env.example` to `.env` and fill with your project's values:

```bash
# Frontend (safe, goes to browser)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# CLI/Server (sensitive, server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_JWT_SECRET=your-jwt-secret-here
```

**❗ SECURITY WARNING**: Never commit your actual `.env` file to version control.
Get your credentials from **Supabase Dashboard → Settings → API**.

## 🗂️ Database Schema Management (Remote Only)

**Important**: All schema changes are applied directly to the remote Supabase instance. We do not use local databases or `supabase start`.

### Migration Files Location
- **Directory**: `/supabase/migrations/`
- **Format**: SQL files with version prefixes (e.g., `001_create_profiles.sql`)

### Applying Migrations to Live Supabase
```bash
# Push all migrations to remote database (after linking project)
supabase db push

# Push specific migration only
supabase db push --included

# Preview changes before applying
supabase db push --dry-run
```

### Migration Best Practices
- **🔧 Test First**: Apply to development Supabase project before production
- **📝 Descriptive Names**: Use clear migration names
- **🔄 Rollbacks**: Include rollback scripts for critical migrations
- **👥 Team Sync**: Commit migrations along with feature changes
- **🔍 Validation**: Check Supabase Dashboard after applying migrations

## 🌐 Edge Functions (Serverless)

### Deploying Functions
```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy payments-webhook
```

### Function Locations
- **Directory**: `/supabase/functions/`
- **Example**: `payments-webhook` function
- **Trigger**: Via CLI or from application

## 🔐 Security & Access Control

### Row Level Security (RLS)
All tables have RLS policies that control:
- ✅ **Public access** to published credit packs
- ✅ **User access** to their own data
- ✅ **Admin access** to all records
- ✅ **Anonymous access** to public content

### Service Role Key
- **Purpose**: CLI operations, migrations, admin functions
- **Privilege Level**: Full database access (bypass RLS)
- **Storage**: Only in `.env` (gitignored)
- **Never**: Use in client-side code or commit to repo

## 📊 Monitoring & Debugging

### Supabase Dashboard Tools
- Check **Realtime Metrics** for performance
- Monitor **Database Health** in dashboard
- View **Logs** for function debugging
- Manage **Users & Security** policies

### CLI Diagnostics
```bash
# Project status overview
supabase status

# Database connection test
supabase db push --dry-run

# Function deployment status
supabase functions list
```

## 🚀 Deployment Workflow

The deployment process handles different environments automatically through:

1. **Environment Variables**: Different project URLs per environment
2. **Migrated Schema**: All tables, policies, and functions
3. **Function Deployment**: Edge functions for business logic
4. **Security Configuration**: RLS policies and auth setup

---

*This setup ensures consistent, secure, and scalable data operations across all environments.*
