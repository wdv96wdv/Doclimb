import { supabase } from './supabase';

// Create user profile in 'profiles' table after sign-up
export async function createProfile(userId, { name, display_nickname, email, climbing_level, preferred_gym, climbing_style }) {
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      name: name,
      display_nickname: display_nickname, // The new '닉네임'
      email: email, // Add the email here
      climbing_level: climbing_level || null,
      preferred_gym: preferred_gym || null,
      climbing_style: climbing_style || [],
      role: 'USER',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error creating profile:', error.message);
    throw error;
  }
}

// Fetch user profile from 'profiles' table by ID
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, display_nickname, email, website, avatar_url, climbing_level, preferred_gym, climbing_style, role, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error.message);
    throw error;
  }
  return data;
}

// Update user profile in 'profiles' table
export async function updateProfile(userId, updates) {
  console.log('Updating profile for userId:', userId, 'with updates:', updates); // Debugging log
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error.message);
    throw error;
  }
}

// Upload avatar to Supabase Storage and return public URL
export async function uploadAvatar(file, userId) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError.message);
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error('Failed to get public URL for uploaded avatar.');
  }

  return publicUrlData.publicUrl;
}