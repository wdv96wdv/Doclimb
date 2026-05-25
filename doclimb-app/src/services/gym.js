import { supabase } from "./supabase";

/**
 * 모든 암장 목록을 가져옵니다.
 */
export const getAllGyms = async () => {
  const { data, error } = await supabase
    .from("gyms")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * 암장의 혼잡도 상태를 업데이트합니다.
 * @param {string} gymId - 암장 UUID
 * @param {number} status - 혼잡도 단계 (0: 쾌적, 1: 보통, 2: 혼잡, 3: 매우혼잡)
 */
export const updateGymStatus = async (gymId, status) => {
  const { data, error } = await supabase
    .from("gyms")
    .update({ 
      current_status: status,
      last_updated: new Date().toISOString() 
    })
    .eq("id", gymId)
    .select();

  if (error) throw error;
  return data;
};

/**
 * 페이지네이션·검색·필터가 적용된 암장 목록
 */
export const getGymsPaginated = async ({
  page = 1,
  pageSize = 10,
  searchTerm = "",
  statusFilter = "all",
} = {}) => {
  let query = supabase.from("gyms").select("*", { count: "exact" });

  if (searchTerm.trim()) {
    query = query.ilike("name", `%${searchTerm}%`);
  }

  if (statusFilter !== "all") {
    query = query.eq("current_status", parseInt(statusFilter, 10));
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await query
    .order("name", { ascending: true })
    .range(from, to);

  if (error) throw error;
  return { data: data || [], count: count || 0 };
};

/**
 * 새 암장 등록 (관리자)
 */
export const createGym = async ({ name, location, phone, description }) => {
  const { error } = await supabase.from("gyms").insert([
    {
      name,
      location,
      phone,
      description,
      current_status: 0,
      last_updated: new Date().toISOString(),
    },
  ]);

  if (error) throw error;
};

/**
 * 암장 실시간 업데이트 구독
 */
export const subscribeToGymUpdates = (onUpdate) => {
  const channel = supabase
    .channel("gym-updates")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "gyms" },
      (payload) => onUpdate(payload.new)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};