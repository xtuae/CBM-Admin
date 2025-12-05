# CBM Admin - Credits Marketplace Admin Panel

Production-ready admin web app for managing the Credits Marketplace. Built with React + TypeScript + Vite + Tailwind CSS + Supabase.

## 🚀 Features

- **Authentication**: Magic link login with admin role enforcement
- **Credit Packs Management**: Create, edit, and manage credit packages
- **Categories Management**: Organize packs with categories and icons
- **User Management**: View and manage user accounts
- **Activity Logging**: Track all admin actions
- **Image Upload**: Upload images to Supabase Storage
- **Responsive Design**: Mobile-friendly admin interface

## 📁 Project Structure

```
apps/admin/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AdminLayout.tsx  # Main layout with sidebar
│   │   ├── RequireAdmin.tsx # Auth guard
│   │   ├── ImageUploader.tsx # File upload component
│   │   ├── DataTable.tsx     # Generic table with pagination
│   │   └── RichTextEditor.tsx # Markdown editor
│   ├── pages/               # Page components
│   │   ├── LoginPage.tsx
│   │   ├── OverviewPage.tsx
│   │   ├── CreditPacksPage.tsx
│   │   ├── CategoriesPage.tsx
│   │   ├── UsersPage.tsx
│   │   ├── ActivityLogPage.tsx
│   │   └── SettlementsPage.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx   # Authentication context
│   ├── lib/
│   │   └── supabase.ts       # Supabase client & types
│   ├── hooks/                # Custom hooks
│   ├── types/                # TypeScript types
│   ├── utils/                # Utility functions
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # App entry point
│   ├── index.css             # Global styles
│   └── vite-env.d.ts         # Vite environment types
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase project (with live database)

### Installation

1. **Navigate to admin directory:**
   ```bash
   cd apps/admin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_APP_TITLE=CBM Admin - Credits Marketplace
   ```

## 🗄️ Database Setup

### 1. Run Migrations

Apply all database migrations in order:

```sql
-- Run in Supabase SQL Editor or via Supabase CLI
-- 1. supabase/migrations/2025-12-05_seed_credit_packs.sql (main schema)
-- 2. supabase/migrations/008_add_admin_activity_log.sql (activity log)
```

### 2. Create Admin User

Run the admin user creation script:

```bash
node ../../create-admin-user.js
```

Or manually via SQL:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'hello@hmhlabz.com';
```

### 3. Setup Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create bucket: `admin-assets`
3. Set to **Public** bucket
4. Configure policies for admin uploads

## 🚀 Development

### Start Development Server

```bash
npm run dev
```

The app will run on `http://localhost:3001`

### Connect to Live Supabase

The app is configured to connect to your **live** Supabase project (not local). Make sure your environment variables point to the production database.

### Build for Production

```bash
npm run build
```

## 📦 Deployment

### Vercel Deployment

#### Option 1: Separate Vercel Project (Recommended)

1. **Create new Vercel project** for admin app
2. **Set build settings:**
   - Framework Preset: `Vite`
   - Root Directory: `apps/admin`
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: `dist`

3. **Environment Variables:**
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_APP_TITLE=CBM Admin - Credits Marketplace
   ```

4. **Deploy:** Push to GitHub and connect to Vercel

#### Option 2: Nested Routes (Mono-repo)

If deploying with the main app:

1. **Vercel JSON config** (`vercel.json` in root):
   ```json
   {
     "rewrites": [
       { "source": "/admin/:path*", "destination": "/admin/:path*" }
     ]
   }
   ```

2. **Set root directory** to `apps/admin` in Vercel project settings

### Custom Domain

Set up `admin.yourdomain.com` pointing to the admin Vercel deployment.

## 🔐 Authentication Flow

1. **Login Page** (`/admin/login`): Enter email for magic link
2. **Magic Link**: Supabase sends login link to email
3. **Profile Check**: `RequireAdmin` component verifies `profiles.role === 'admin'`
4. **Access**: Redirects to `/admin/overview` if admin, otherwise shows error

## 🧪 Testing & Verification

### Manual Testing Checklist

1. **Login Flow:**
   - ✓ Visit `/admin/login`
   - ✓ Enter admin email, receive magic link
   - ✓ Click link, redirect to `/admin/overview`

2. **Admin Access:**
   - ✓ Non-admin users cannot access `/admin/*`
   - ✓ Admin role properly checked in `profiles` table

3. **Credit Packs:**
   - ✓ View list of seeded credit packs
   - ✓ Create new pack with form validation
   - ✓ Upload images to `admin-assets` bucket
   - ✓ Edit existing packs
   - ✓ Activity logged in `admin_activity_log`

4. **Categories:**
   - ✓ View Hot Pack & Chill Pack categories
   - ✓ Create new category with icon upload
   - ✓ Edit category details

5. **Security:**
   - ✓ RLS prevents non-admin writes
   - ✓ Service role key not exposed to client

### SQL Verification

```sql
-- Check admin user
SELECT id, email, role FROM profiles WHERE role = 'admin';

-- Check seeded data
SELECT COUNT(*) FROM credit_packs;
SELECT COUNT(*) FROM categories;

-- Check activity logging
SELECT * FROM admin_activity_log ORDER BY created_at DESC LIMIT 5;
```

## 🔧 Configuration

### Supabase Storage

**Bucket:** `admin-assets`
- **Public Access:** ✅ Enabled
- **File Types:** Images (jpg, png, webp)
- **Max Size:** 5MB per file

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | ✅ |
| `VITE_APP_TITLE` | App title for SEO | ❌ |

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors:**
   - Ensure all dependencies are installed: `npm install`
   - Check TypeScript errors: `npm run lint`

2. **Auth Issues:**
   - Verify admin role in `profiles` table
   - Check Supabase Auth settings

3. **Storage Upload Errors:**
   - Verify `admin-assets` bucket exists and is public
   - Check RLS policies for storage

4. **Deployment Issues:**
   - Confirm environment variables are set in Vercel
   - Check build logs for errors

## 📚 API Reference

### Admin Activity Logging

```typescript
import { supabase } from '../lib/supabase'

const logActivity = async (action: string, source: string, meta?: any) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('admin_activity_log').insert({
    admin_id: user.id,
    action,
    source,
    meta
  })
}
```

### File Upload to Storage

```typescript
import { supabase } from '../lib/supabase'

const uploadFile = async (file: File, bucket = 'admin-assets') => {
  const fileName = `${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return publicUrl
}
```

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use Tailwind CSS for styling
3. Add activity logging for admin actions
4. Test on mobile devices
5. Follow component naming conventions

## 📄 License

This project is part of the CBM Platform. See main project license.