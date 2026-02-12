import { supabase } from './supabase';

const BUCKET_NAME = 'climbing';

/**
 * Get all community posts.
 */
export const getPosts = async () => {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*, profiles(display_nickname, avatar_url)') // Join with profiles to get user info
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get a single post by its ID.
 * @param {number} id - The ID of the post.
 */
export const getPostById = async (id) => {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*, profiles(display_nickname, avatar_url)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create a new community post.
 * @param {object} postData - The post data.
 * @param {string} postData.caption - The caption for the post.
 * @param {File} postData.imageFile - The image file to upload.
 */
export const createPost = async ({ caption, imageFile }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  // 1. Upload image to Supabase Storage
  const fileExtension = imageFile.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
  const filePath = `${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, imageFile);

  if (uploadError) throw uploadError;

  // 2. Get the public URL of the uploaded image
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  // 3. Insert post data into the community_posts table
  const { data, error } = await supabase
    .from('community_posts')
    .insert([{ caption, image_url: publicUrl, user_id: user.id }])
    .select();

  if (error) throw error;
  return data;
};

/**
 * Update an existing community post.
 * @param {number} id - The ID of the post to update.
 * @param {object} updates - The updates to apply.
 * @param {string} [updates.caption] - The new caption.
 * @param {File} [updates.imageFile] - The new image file to upload (optional).
 */
export const updatePost = async (id, { caption, imageFile }) => {
  let imageUrl;

  if (imageFile) {
    // If a new image is provided, upload it and get the new URL
    const fileExtension = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    const filePath = `${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, imageFile);
    
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    imageUrl = publicUrl;
  }

  const updatesToApply = {};
  if (caption) updatesToApply.caption = caption;
  if (imageUrl) updatesToApply.image_url = imageUrl;

  const { data, error } = await supabase
    .from('community_posts')
    .update(updatesToApply)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};

/**
 * Delete a community post.
 * @param {number} id - The ID of the post to delete.
 */
export const deletePost = async (id) => {
  // Optionally, also delete the image from storage here.
  // This requires getting the post details first to find the image URL.

  const { data, error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return data;
};