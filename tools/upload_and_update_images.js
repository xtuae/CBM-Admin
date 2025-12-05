#!/usr/bin/env node

/**
 * Upload and Update Images Script
 *
 * This script uploads credit pack images from a local directory to Supabase Storage
 * and updates the corresponding database records with the public URLs.
 *
 * Usage:
 *   1. Set environment variables:
 *      export SUPABASE_URL=your_supabase_project_url
 *      export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 *
 *   2. Place images in ./seed-images/ directory with slug-based names:
 *      - ultimate-power-pack.png
 *      - elite-credits-bundle.jpg
 *      - relaxed-starter-pack.png
 *      etc.
 *
 *   3. Run the script:
 *      node tools/upload_and_update_images.js --dir ./seed-images
 *
 * Requirements:
 * - @supabase/supabase-js package
 * - Node.js environment with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const BUCKET_NAME = 'public-assets';
const MAX_RETRIES = 2;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let imageDir = './seed-images';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir' && i + 1 < args.length) {
      imageDir = args[i + 1];
      i++; // Skip next arg
    }
  }

  return { imageDir };
}

// Validate environment variables
function validateEnvironment() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    logError('SUPABASE_URL environment variable is required');
    process.exit(1);
  }

  if (!supabaseKey) {
    logError('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    process.exit(1);
  }

  return { supabaseUrl, supabaseKey };
}

// Initialize Supabase client
function createSupabaseClient(url, key) {
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Create bucket if it doesn't exist
async function ensureBucketExists(supabase, bucketName) {
  try {
    logInfo(`Checking if bucket '${bucketName}' exists...`);

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      logError(`Failed to list buckets: ${listError.message}`);
      return false;
    }

    const bucketExists = buckets.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      logInfo(`Creating bucket '${bucketName}'...`);

      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      });

      if (createError) {
        logError(`Failed to create bucket: ${createError.message}`);
        return false;
      }

      logSuccess(`Bucket '${bucketName}' created successfully`);
    } else {
      logInfo(`Bucket '${bucketName}' already exists`);
    }

    return true;
  } catch (error) {
    logError(`Error ensuring bucket exists: ${error.message}`);
    return false;
  }
}

// Upload file with retry logic
async function uploadFileWithRetry(supabase, bucketName, filePath, fileName, maxRetries = MAX_RETRIES) {
  const fileBuffer = readFileSync(filePath);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logInfo(`Uploading ${fileName} (attempt ${attempt}/${maxRetries})...`);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileBuffer, {
          contentType: getMimeType(fileName),
          upsert: true
        });

      if (error) {
        if (attempt === maxRetries) {
          logError(`Failed to upload ${fileName} after ${maxRetries} attempts: ${error.message}`);
          return null;
        } else {
          logWarning(`Upload attempt ${attempt} failed, retrying...`);
          continue;
        }
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      logSuccess(`Successfully uploaded ${fileName}`);
      return publicUrl;

    } catch (error) {
      if (attempt === maxRetries) {
        logError(`Failed to upload ${fileName} after ${maxRetries} attempts: ${error.message}`);
        return null;
      } else {
        logWarning(`Upload attempt ${attempt} failed, retrying...`);
      }
    }
  }

  return null;
}

// Get MIME type from file extension
function getMimeType(filename) {
  const ext = extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

// Update database record
async function updateDatabaseRecord(supabase, slug, imageUrl) {
  try {
    const { error } = await supabase
      .from('credit_packs')
      .update({ featured_image_url: imageUrl })
      .eq('slug', slug);

    if (error) {
      logError(`Failed to update database for ${slug}: ${error.message}`);
      return false;
    }

    logSuccess(`Updated database record for ${slug}`);
    return true;
  } catch (error) {
    logError(`Database update error for ${slug}: ${error.message}`);
    return false;
  }
}

// Extract slug from filename (remove extension)
function extractSlug(filename) {
  return basename(filename, extname(filename));
}

// Main execution function
async function main() {
  const { imageDir } = parseArgs();
  const { supabaseUrl, supabaseKey } = validateEnvironment();

  logInfo('🚀 Starting image upload and database update process...');
  logInfo(`📁 Image directory: ${imageDir}`);
  logInfo(`🗄️  Target bucket: ${BUCKET_NAME}`);

  const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

  // Ensure bucket exists
  const bucketReady = await ensureBucketExists(supabase, BUCKET_NAME);
  if (!bucketReady) {
    logError('Cannot proceed without bucket. Exiting.');
    process.exit(1);
  }

  // Read image files
  let imageFiles;
  try {
    imageFiles = readdirSync(imageDir)
      .filter(file => {
        const ext = extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
      })
      .map(file => ({
        filename: file,
        filepath: join(imageDir, file),
        slug: extractSlug(file)
      }));

    logInfo(`📸 Found ${imageFiles.length} image files to process`);
  } catch (error) {
    logError(`Failed to read image directory: ${error.message}`);
    process.exit(1);
  }

  if (imageFiles.length === 0) {
    logWarning('No image files found in the specified directory');
    process.exit(0);
  }

  // Process each file
  let successCount = 0;
  let failureCount = 0;

  for (const { filename, filepath, slug } of imageFiles) {
    logInfo(`\n🔄 Processing ${filename} (slug: ${slug})...`);

    // Upload file
    const imageUrl = await uploadFileWithRetry(supabase, BUCKET_NAME, filepath, filename);

    if (!imageUrl) {
      logError(`Skipping database update for ${slug} due to upload failure`);
      failureCount++;
      continue;
    }

    // Update database
    const dbUpdated = await updateDatabaseRecord(supabase, slug, imageUrl);

    if (dbUpdated) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  // Summary
  logInfo(`\n📊 Process Complete:`);
  logSuccess(`Successful uploads/updates: ${successCount}`);
  if (failureCount > 0) {
    logError(`Failed uploads/updates: ${failureCount}`);
  }

  if (successCount > 0 && failureCount === 0) {
    logSuccess('🎉 All images uploaded and database updated successfully!');
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
main().catch(error => {
  logError(`Script failed: ${error.message}`);
  process.exit(1);
});