import { supabase } from './supabase';

const CREDIT_PACK_BUCKET = 'public-assets';
const CREDIT_PACK_FOLDER = 'credit-packs';

export interface UploadResult {
  url: string | null;
  error: string | null;
}

export async function uploadCreditPackImage(file: File): Promise<UploadResult> {
  try {
    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { url: null, error: 'User not authenticated. Please log in.' };
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: 'File size exceeds 5MB limit.' };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { url: null, error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.' };
    }

    // Note: Bucket must be pre-created by admin in Supabase dashboard
    // We cannot create buckets programmatically due to RLS policies
    console.log('Attempting upload to pre-existing public-assets bucket...');

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `${timestamp}-${randomString}.${fileExt}`;
    const path = `${CREDIT_PACK_FOLDER}/${filename}`;

    console.log('Uploading to path:', path);

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(CREDIT_PACK_BUCKET)
      .upload(path, file, {
        cacheControl: '86400', // 24 hours
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      let errorMessage = 'Upload failed';

      if (uploadError.message?.includes('authenticated')) {
        errorMessage = 'Authentication error. Please try logging out and back in.';
      } else if (uploadError.message?.includes('storage.objects.insert')) {
        errorMessage = 'Permission denied. You may not have upload permissions.';
      } else if (uploadError.message?.includes('size')) {
        errorMessage = 'File too large. Maximum size is 5MB.';
      }

      return { url: null, error: errorMessage };
    }

    console.log('Upload successful:', uploadData);

    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from(CREDIT_PACK_BUCKET)
      .getPublicUrl(path);

    if (!urlData?.publicUrl) {
      return { url: null, error: 'Failed to generate public URL for uploaded image.' };
    }

    return { url: urlData.publicUrl, error: null };

  } catch (err) {
    console.error('Unexpected upload error:', err);
    return { url: null, error: 'An unexpected error occurred. Please try again.' };
  }
}

// Test function to verify bucket access
export async function testBucketAccess(): Promise<{ success: boolean; message: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, message: 'User not authenticated' };
    }

    // Try to list files in the bucket (this should work if RLS allows it)
    const { data, error } = await supabase
      .storage
      .from(CREDIT_PACK_BUCKET)
      .list(CREDIT_PACK_FOLDER, { limit: 1 });

    if (error) {
      return { success: false, message: `Bucket access failed: ${error.message}` };
    }

    return { success: true, message: 'Bucket access successful' };
  } catch (err) {
    return { success: false, message: `Unexpected error: ${err}` };
  }
}

// Legacy function for backward compatibility
export async function uploadCreditPackImageSimple(file: File): Promise<string | null> {
  const result = await uploadCreditPackImage(file);
  return result.url;
}
