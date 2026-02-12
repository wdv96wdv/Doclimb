import { supabase } from "./supabase";

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