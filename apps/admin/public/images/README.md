# Placeholder Images

This directory should contain placeholder images for the admin panel.

## ⚠️ IMPORTANT: Storage Bucket Setup

Before image uploads will work, you must create the storage bucket in your Supabase dashboard:

1. Go to **Supabase Dashboard → Storage**
2. Click **"Create bucket"**
3. Name: `public-assets`
4. Enable: **Public bucket** (checkmark)
5. Click **"Create bucket"**

The bucket policies are already set up via migration `2025-12-06_add_storage_policies.sql`.

## Current Placeholders:

### default-pack.png (Credit Pack Placeholders)
- Used for credit pack thumbnails when no image is set
- Simple graphical representation of a credit pack/package
- Recommended size: 96x96px or larger
- PNG format with transparent background preferred

### default-category.png (Category Icons)
- Used for category icons when no custom icon is uploaded
- Should be a generic/purposive icon that works across different categories
- Recommended size: 96x96px or larger
- PNG format with transparent background preferred

## Adding Placeholder Images:

### Option 1: Download free icons
- Search for "package PNG transparent" or "category icon PNG" on icon websites
- Free resources: Flaticon, IconFinder, Freepik, etc.
- Look for "commercial use" licenses when possible

### Option 2: Create using design tools
- Use Canva, Figma, or similar online design tools
- Search for "package icon" or "box icon" templates
- Create a simple, recognizable symbol

### Option 3: Use the built-in fallbacks
- **Solid gray SVG backgrounds** show automatically
- Credit packs show a "Package" icon on gray background
- Categories show default geometric shapes
- **Works immediately** - no additional setup needed
- Customize with PNG files later for branding

## File Naming:
- Place images directly in this `/public/images/` directory
- Use **exactly** these names: `default-pack.png` and `default-category.png`
- Vite serves `/public` files at root URL so `/images/default-pack.png` works in code

## System Behavior:
- ✅ **Never broken images** - always falls back gracefully
- 🔄 **Multi-level fallback**: Custom PNG → SVG placeholder → Default shape
- 📱 **Responsive** - scales properly across all screen sizes
- 🚀 **Instant loading** - local images load immediately
