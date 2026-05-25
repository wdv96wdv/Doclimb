import { supabase } from "./supabase";

export const APP_BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://doclimb.vercel.app";

export async function resetPasswordForEmail(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${APP_BASE_URL}/update-password`,
  });
  if (error) throw error;
}

export async function signInWithOAuth(provider) {
  const options = {
    redirectTo: `${APP_BASE_URL}/`,
  };
  if (provider === "google") {
    options.queryParams = {
      access_type: "offline",
      prompt: "consent",
    };
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options,
  });
  if (error) throw error;
  return data;
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function deleteUserAccount() {
  const { error } = await supabase.rpc("delete_user_account");
  if (error) throw error;
}
