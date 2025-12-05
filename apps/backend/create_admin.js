#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'kudoadmin@admin.com',
      password: 'admin1234',
      user_metadata: { full_name: 'Admin User' },
      email_confirm: true
    });

    if (authError && !authError.message.includes('already registered')) {
      console.error('Error creating auth user:', authError);
      return;
    }

    const userId = authData?.user?.id;
    if (!userId) {
      console.error('No user ID returned');
      return;
    }

    // Update profile with admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return;
    }

    console.log('Admin user created successfully!');
    console.log('Username: kudoadmin@admin.com');
    console.log('Password: admin1234');

  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminUser();
