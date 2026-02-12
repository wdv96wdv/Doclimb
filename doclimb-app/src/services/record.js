import { supabase } from './supabase';

/**
 * 새로운 클라이밍 기록을 생성합니다.
 * @param {object} recordData - 생성할 기록 데이터. (date, location, climb_type, difficulty, success)
 */
export const createRecord = async (recordData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { data, error } = await supabase
    .from('records')
    .insert([{ ...recordData, user_id: user.id }])
    .select();

  if (error) {
    console.error('Error creating record:', error);
    throw error;
  }
  return data;
};

/**
 * 현재 로그인된 사용자의 모든 클라이밍 기록을 가져옵니다.
 */
export const getRecords = async () => {
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching records:', error);
    throw error;
  }
  return data;
};

/**
 * 특정 ID의 클라이밍 기록을 가져옵니다.
 * @param {number} id - 가져올 기록의 ID.
 */
export const getRecordById = async (id) => {
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching record with id ${id}:`, error);
    throw error;
  }
  return data;
};

/**
 * 특정 ID의 클라이밍 기록을 삭제합니다.
 * @param {number} id - 삭제할 기록의 ID.
 */
export const deleteRecord = async (id) => {
  const { error } = await supabase
    .from('records')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting record with id ${id}:`, error);
    throw error;
  }
  return true;
};

/**
 * 특정 ID의 클라이밍 기록을 수정합니다.
 * @param {number} id - 수정할 기록의 ID.
 * @param {object} recordData - 수정할 기록 데이터.
 */
export const updateRecord = async (id, recordData) => {
  const { data, error } = await supabase
    .from('records')
    .update(recordData)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating record with id ${id}:`, error);
    throw error;
  }
  return data;
};
