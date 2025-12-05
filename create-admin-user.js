const { createClient } = require('@supabase/supabase-js');

// Replace these with your actual Supabase project details
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project-ref.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user: hello@hmhlabz.com...');

    // Create the user in auth.users
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: 'hello@hmhlabz.com',
      password: 'admin@1234',
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: 'Admin User'
      }
    });

    if (createError) {
      console.error('❌ Error creating user:', createError.message);
      return;
    }

    console.log('✅ User created successfully:', userData.user.id);

    // Wait a moment for the profile trigger to create the profile record
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update the profile role to admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        full_name: 'Admin User'
      })
      .eq('id', userData.user.id)
      .select();

    if (profileError) {
      console.error('❌ Error updating profile:', profileError.message);
      return;
    }

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email: hello@hmhlabz.com');
    console.log('🔑 Password: admin@1234');
    console.log('👑 Role: admin');
    console.log('🆔 User ID:', userData.user.id);

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the function
createAdminUser();