import { supabase } from "./supabase";
import { getCurrentUser } from "./auth";

export async function getBetas() {
  const { data, error } = await supabase
    .from("betas")
    .select(`
      *,
      profiles (
        display_nickname,
        avatar_url
      ),
      route_ratings (
        perceived_difficulty,
        user_id
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createBeta(betaData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { error } = await supabase.from("betas").insert([
    {
      user_id: user.id,
      ...betaData,
    },
  ]);

  if (error) throw error;
}

export async function deleteBeta(betaId) {
  const { error } = await supabase.from("betas").delete().eq("id", betaId);
  if (error) throw error;
}

export async function upsertBetaRating(betaId, userId, perceivedDifficulty) {
  const { error } = await supabase.from("route_ratings").upsert(
    {
      beta_id: betaId,
      user_id: userId,
      perceived_difficulty: perceivedDifficulty,
    },
    { onConflict: "beta_id, user_id" }
  );
  if (error) throw error;
}
