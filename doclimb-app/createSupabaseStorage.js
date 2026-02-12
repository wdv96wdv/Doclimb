
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Load environment variables from .env file

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your environment variables or in a .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createStorageBucket(bucketName) {
  try {
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: false, // Set to true if you want the bucket to be publicly accessible
    });

    if (error) {
      if (error.statusCode === '409') { // HTTP 409 Conflict - bucket already exists
        console.warn(`Bucket '${bucketName}' already exists. Skipping creation.`);
      } else {
        throw error;
      }
    } else {
      console.log(`Bucket '${bucketName}' created successfully.`);
      console.log(data);
    }
  } catch (error) {
    console.error(`Error creating bucket '${bucketName}':`, error.message);
  }
}

// Example usage:
// To run this script, provide the bucket name as a command-line argument:
// node createSupabaseStorage.js my-new-bucket

const bucketNameArg = process.argv[2];

if (!bucketNameArg) {
  console.error("Usage: node createSupabaseStorage.js <bucket-name>");
  process.exit(1);
}

createStorageBucket(bucketNameArg);
