import { supabase } from "./supabase";

export async function getUsersWithMemberships(searchTerm = "") {
  let query = supabase
    .from("profiles")
    .select(`*, memberships(id, type, end_date, status)`);

  if (searchTerm) {
    query = query.or(
      `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
    );
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function grantMembership(userId, type, days) {
  const { data: existing } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .gte("end_date", new Date().toISOString().split("T")[0])
    .maybeSingle();

  let startDate = new Date();
  let endDate = new Date();

  if (existing) {
    const currentEndDate = new Date(existing.end_date);
    startDate = currentEndDate;
    endDate = new Date(currentEndDate);
    endDate.setDate(currentEndDate.getDate() + days);
    await supabase
      .from("memberships")
      .update({ status: "extended" })
      .eq("id", existing.id);
  } else {
    endDate.setDate(startDate.getDate() + days);
  }

  const { error } = await supabase.from("memberships").insert([
    {
      user_id: userId,
      type,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      status: "active",
    },
  ]);

  if (error) throw error;
}

export async function cancelActiveMembership(userId) {
  const { error } = await supabase
    .from("memberships")
    .update({
      status: "cancelled",
      end_date: new Date().toISOString().split("T")[0],
    })
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) throw error;
}
