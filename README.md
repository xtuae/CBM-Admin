# Credits-Based Marketplace & Managed Settlement Platform

## Overview

This is a credits-based digital marketplace platform where users can purchase platform credits using traditional payment methods. All credit settlements are managed internally by administrators through controlled blockchain-based reward transfers. The system is designed to be bank and payment-gateway compliant at all times.

**Important**: This platform does not function as a public crypto exchange and maintains strict compliance with banking regulations. All blockchain-related activities are admin-controlled and back-office only.

## Key Principles

- **Payments represent digital credits/services only** - No public crypto trading, swapping, or on-chain payment flows
- **Admin-controlled settlements** - Blockchain rewards are discretionary and processed internally
- **Immutable ledger tracking** - Every credit movement is tracked via an immutable ledger
- **Bank-safe terminology** - Uses terms like "Credits", "Digital Assets", "Platform Balance" while avoiding crypto exchange terminology
- **Full auditability** - System must be auditable, scalable, and secure

## User Roles

### Guest
- View public pages
- View credit pack offerings

### User
- Register and login
- Purchase credit packs via payment gateway
- View credit balance and ledger
- Manage wallet addresses for reward settlement tracking
- View reward settlement history

### Admin
- Full system access
- Manage users and balances
- Manage credit packs
- Process and record reward settlements
- View and audit all transactions and ledger entries

## System Architecture

This project follows a monorepo structure for better code sharing and maintenance:

### `/apps/web`
Web-based frontend application providing:
- Public area for guest users
- User dashboard with credit balance, purchase history, and settlement tracking
- Admin panel for system management

### `/apps/backend`
REST API backend built with Node.js + TypeScript:
- Authentication & authorization
- Business rules and validation
- Credit ledger enforcement
- Admin-only settlement logic

### `/database/migrations`
Database migration scripts for PostgreSQL (Supabase-compatible) with core tables:
- `profiles` - User profiles and authentication
- `credit_packs` - Available credit packages
- `orders` - Purchase transactions
- `credit_ledger` - Immutable credit movement records
- `nila_transfers` - Blockchain settlement records
- `wallet_addresses` - User wallet management

### `/packages/shared`
Shared code and utilities used across frontend and backend applications.

## Integration Layer

- **Payment Gateway**: Webhook-based confirmation for credit purchases
- **Blockchain Settlement**: Admin-controlled reward transfers (e.g., $NILA rewards)
- **No direct user-to-blockchain integration**: All blockchain activities are admin-only

## Data Integrity Rules

- Credit balance must never go below zero
- Every credit change creates a ledger record
- Orders must be paid before credits are added
- Settlement requires sufficient credit balance
- All admin actions are auditable

## API Standards

- RESTful API under `/api/v1`
- JWT-based authentication
- Role-based access control
- JSON request/response format
- Secure webhook handling

## Non-Functional Requirements

- Bank and payment gateway friendly
- Secure by default (no anonymous access)
- Scalable architecture
- Clear audit trail
- Production-ready MVP

## Development

This project uses AI-assisted development tools to accelerate delivery within the 2-3 week MVP timeline.

## Success Criteria

- Users can successfully purchase credits
- Credits correctly update balances and ledger
- Admin can process and record settlements
- System remains bank-compliant
- Full auditability of all transactions

## Getting Started

### Local Development - Live Supabase

**Note**: Local development connects directly to live Supabase projects. We do NOT use local Supabase containers (`supabase start`).

1. **Set up Supabase project** (see Deployment section below for detailed steps)

2. **Prepare environment variables**:
   ```bash
   # Copy the template
   cp .env.example .env

   # Fill in your Supabase project details:
   # VITE_SUPABASE_URL=https://your-project-id.supabase.co
   # VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Install dependencies**:
   ```bash
   # Frontend dependencies
   cd apps/web
   npm install

   # Backend dependencies (if needed)
   cd ../backend
   npm install
   ```

4. **Deploy database schema** to your live Supabase project:
   ```bash
   # Link CLI to your project first
   supabase login
   supabase link --project-ref your-project-id

   # Push migrations
   supabase db push --include-all
   ```

5. **Start development server**:
   ```bash
   cd apps/web
   npm run dev
   ```

The app will now connect directly to your live Supabase database for local development!

## Deployment

### Prerequisites

- [Supabase Account](https://supabase.com)
- [Vercel Account](https://vercel.com) (for frontend deployment)
- [GitHub Account](https://github.com)

### Supabase Setup

1. **Create Supabase Project**
   ```bash
   # Create new project on https://supabase.com/dashboard
   # Or use Supabase CLI
   supabase login
   supabase projects create "credits-marketplace"
   ```

2. **Link Local Project to Supabase**
   ```bash
   # Link your local project to remote Supabase instance
   supabase link --project-ref your-project-id

   # Apply all migrations and functions
   supabase db push --include-all
   supabase functions deploy payments-webhook
   ```

3. **Get Supabase Credentials**
   - Go to your project in [Supabase Dashboard](https://supabase.com/dashboard)
   - Go to Settings → API
   - Copy your `Project URL` and `anon/public` key
   - Go to Settings → API → JWT Secret (for server-side JWT verification)

### Vercel Deployment (Frontend)

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project" and import your GitHub repository
   - Set build settings:
     - **Framework Preset**: Vite
     - **Root Directory**: `apps/web`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Configure Environment Variables**
   In your Vercel project settings, add:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Environment Variables

#### Development (Local)
```bash
# Copy and fill in .env.example
cp .env.example .env

# Required variables:
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Local development only
SUPABASE_JWT_SECRET=your-jwt-secret-here
```

#### Production (Vercel)
Set these in Vercel project environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Database Setup

1. **Initialize Database**
   ```bash
   # Apply all schema and data
   supabase db reset --linked --yes
   supabase db push --include-all
   ```

2. **Verify Setup**
   ```bash
   # Check tables are created
   supabase db diff

   # List all tables
   psql -h your-db-host -d postgres -U postgres -c "\dt"
   ```

### Post-Deployment Verification

1. **Test Authentication**
   - Register a new user
   - Verify user profile is created with correct role

2. **Test Credit Purchases**
   - Purchase a credit pack
   - Verify order creation and credit ledger updates
   - Verify Edge Function receives payment webhook

3. **Test Admin Functions**
   - Login as admin user
   - Test credit pack management
   - Test user management functions

4. **Database Audit**
   - Verify all Row Level Security policies are active
   - Test RPC functions have correct permissions
   - Check Edge Function deployment and access

## Vercel Frontend Deployment

### Prerequisites
- ✅ **GitHub Repository**: Code pushed to GitHub
- ✅ **Supabase Project**: Live database configured
- ✅ **Supabase Edge Functions**: Deployed via CLI

### Step-by-Step Vercel Setup

1. **Connect GitHub Repository**
   - Visit [vercel.com](https://vercel.com) and log in
   - Click **"New Project"** → **"Import Git Repository"**
   - Select your GitHub repository
   - Click **"Import"**

2. **Configure Build Settings**
   ```yaml
   # Vercel automatically detects Vite, but verify these settings:

   Framework Preset: Vite
   Root Directory: apps/web
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   Node Version: 18.x (or latest LTS)
   ```

3. **Set Environment Variables**
   In **"Project Settings"** → **"Environment Variables"**, add:

   ```bash
   # Frontend Supabase Configuration (safe to expose)
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here

   # Optional - for debugging
   VITE_APP_ENV=production
   VITE_APP_TITLE="Credits Marketplace"
   ```

4. **Deploy**
   - Click **"Deploy"**
   - Vercel will build your `apps/web` directory
   - Site will be available at `your-project.vercel.app`

## 🔄 Environment Variable Alignment

**Important**: Both local development and Vercel deployment use the **same Supabase project**. This ensures consistent data and behavior across environments.

### Environment Variable Comparison

| Variable                 | Local `.env`       | Vercel Project Settings | Notes |
| ------------------------ | ------------------ | ----------------------- | ----- |
| `VITE_SUPABASE_URL`      | `https://your-project-id.supabase.co` | **same value** | Frontend URL - safe to expose |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key-here` | **same value** | Anonymous key - safe to expose |

### Environment Management Strategy

- ✅ **Single Supabase Project**: Both local and deployed app use identical Supabase credentials
- ✅ **No Environment Switching**: No conditional URL swaps based on `NODE_ENV`
- ✅ **Future Production**: When creating separate "prod" Supabase project, update only Vercel env vars
- ✅ **Local Consistency**: Development experience mirrors production exactly

### Post-Deployment Testing

- ✅ **Authentication**: User registration works
- ✅ **Admin Panel**: Accessible at `/admin/login`
- ✅ **API Connectivity**: Supabase queries work
- ✅ **Image Uploads**: Storage integration functional
- ✅ **Responsive Design**: Mobile and desktop UI

### Important Notes

- **🎯 Supabase Edge Functions**: Deployed via Supabase CLI, NOT Vercel
  ```bash
  supabase functions deploy payments-webhook
  ```
- **🔄 Database**: All migrations applied via Supabase CLI
- **⚡ Performance**: Vercel provides global CDN
- **🔒 Security**: Environment variables safely managed
- **📊 Analytics**: Vercel provides built-in analytics

### Troubleshooting Vercel

**Build Fails:**
```bash
# Check if dependencies are in apps/web/package.json
ls apps/web/package.json
```

**Environment Variables Not Working:**
```bash
# Ensure VITE_ prefix for client-side variables
# Redeploy after adding environment variables
```

**API Connection Issues:**
```bash
# Verify Supabase credentials are correct
# Check browser network tab for failed requests
```

### Security Checklist

- ✅ Environment variables contain no secrets (.env files are gitignored)
- ✅ Supabase RLS policies protect all tables appropriately
- ✅ Service role keys are never exposed to frontend
- ✅ Admin operations use secure RPC functions
- ✅ Payment webhooks use proper signature validation
- ✅ Database triggers maintain data integrity
