#!/usr/bin/env node

// Production admin user creation script for live Supabase
// Run this after deploying backend to production

const { createClient } = require('@supabase/supabase-js');

// Load production credentials from .env
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  console.log('Please ensure these are set in production:');
  console.log('SUPABASE_URL=https://anehzpnyjrkerrfhvtwt.supabase.co');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createLiveAdminUser() {
  console.log('🚀 Creating production admin user...');

  try {
    // Step 1: Create auth user with admin metadata
    console.log('📧 Creating auth user...');

    const adminEmail = 'admin@creditsmarketplace.com'; // Change this to your preferred admin email
    const adminPassword = generateSecurePassword(); // Or set your own password

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      user_metadata: {
        full_name: 'Super Admin',
        role: 'admin'
      },
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('ℹ️  User already exists. Promoting existing user to admin...');
        await promoteExistingUserToAdmin(adminEmail);
        return;
      } else {
        console.error('❌ Error creating auth user:', authError);
        return;
      }
    }

    const userId = authData?.user?.id;
    if (!userId) {
      console.error('❌ No user ID returned from auth creation');
      return;
    }

    console.log('✅ Auth user created with ID:', userId);

    // Step 2: Update profile with admin role
    console.log('👑 Updating profile with admin role...');

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('❌ Error updating profile role:', profileError);
      return;
    }

    console.log('✅ Profile updated with admin role');
    console.log('');
    console.log('🎉 ADMIN USER CREATED SUCCESSFULLY!');
    console.log('====================================');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Save this password securely and change it after first login!');
    console.log('');
    console.log('🔗 Admin Login URL: /admin/login');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function promoteExistingUserToAdmin(email) {
  try {
    console.log('🔍 Finding user profile...');

    // Get user profile by email
    const { data: profiles, error: findError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', email);

    if (findError) {
      console.error('❌ Error finding user:', findError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.error('❌ No profile found for email:', email);
      return;
    }

    const profile = profiles[0];

    if (profile.role === 'admin') {
      console.log('ℹ️  User is already an admin');
      console.log(`📧 Email: ${email}`);
      console.log('🔑 Password: (use existing password or reset)');
      return;
    }

    // Promote to admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('❌ Error promoting user to admin:', updateError);
      return;
    }

    console.log('✅ User promoted to admin successfully!');
    console.log(`📧 Email: ${email}`);
    console.log('🔑 Password: (use existing password)');
    console.log('');
    console.log('🔗 Admin Login URL: /admin/login');

  } catch (error) {
    console.error('❌ Error in promotion:', error);
  }
}

function generateSecurePassword(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

createLiveAdminUser();
