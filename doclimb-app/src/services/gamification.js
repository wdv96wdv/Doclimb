import { supabase } from "./supabase";

/**
 * 뱃지 획득 조건을 체크하고 새로운 뱃지를 수여합니다.
 * @param {string} userId - 유저 ID
 */
export const checkAndAwardBadges = async (userId) => {
  try {
    // 1. 현재 유저의 뱃지 획득 현황 조회
    const { data: earnedBadges } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);
    
    const earnedBadgeIds = earnedBadges?.map(b => b.badge_id) || [];

    // 2. 전체 뱃지 정보 조회
    const { data: allBadges } = await supabase
      .from('badges')
      .select('*');

    if (!allBadges) return;

    // 3. 아직 획득하지 않은 뱃지 필터링
    const unearnedBadges = allBadges.filter(b => !earnedBadgeIds.includes(b.id));

    if (unearnedBadges.length === 0) return;

    // 4. 유저의 등반 통계 조회
    const { data: records } = await supabase
      .from('records')
      .select('*')
      .eq('user_id', userId);

    if (!records) return;

    const totalCount = records.length;
    const totalSuccess = records.filter(r => r.success).length;
    const gymSet = new Set(records.map(r => r.location).filter(Boolean));
    const gymCount = gymSet.size;

    // TODO: 주간 카운팅 등 복잡한 조건은 나중에 보강 가능
    
    // 5. 조건 체크 및 지급
    const newlyEarned = [];

    for (const badge of unearnedBadges) {
      let isMet = false;
      
      switch (badge.requirement_type) {
        case 'total_count':
          if (totalCount >= badge.requirement_value) isMet = true;
          break;
        case 'total_success':
          if (totalSuccess >= badge.requirement_value) isMet = true;
          break;
        case 'gym_count':
          if (gymCount >= badge.requirement_value) isMet = true;
          break;
        // 다른 타입도 필요에 따라 확장
        default:
          break;
      }

      if (isMet) {
        newlyEarned.push({
          user_id: userId,
          badge_id: badge.id
        });
      }
    }

    if (newlyEarned.length > 0) {
      const { error } = await supabase
        .from('user_badges')
        .insert(newlyEarned);
      
      if (error) throw error;
      
      return newlyEarned.map(nb => {
        const fullBadge = allBadges.find(b => b.id === nb.badge_id);
        return fullBadge;
      });
    }

    return [];
  } catch (error) {
    console.error("Badge awarding error:", error);
    return [];
  }
};

/**
 * 특정 유저의 뱃지들을 조회합니다.
 */
export const getUserBadges = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        earned_at,
        badges (*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Fetch user badges error:", error);
    return [];
  }
};

/**
 * 암장별 랭킹 데이터를 조회합니다.
 */
export const fetchGymRankings = async (limitPerGym = 3) => {
  try {
    const { data, error } = await supabase
      .from('records')
      .select(`
        location,
        success,
        user_id,
        profiles!inner (
          display_nickname,
          avatar_url
        )
      `)
      .eq('success', true);

    if (error) throw error;

    // 데이터 가공: 암장별 -> 유저별 완등 횟수 집계
    const gymRankings = {};

    data.forEach(record => {
      const gym = record.location || "미지정 암장";
      if (!gymRankings[gym]) {
        gymRankings[gym] = {};
      }

      const uid = record.user_id;
      if (!gymRankings[gym][uid]) {
        gymRankings[gym][uid] = {
          nickname: record.profiles.display_nickname,
          avatar: record.profiles.avatar_url,
          count: 0
        };
      }
      gymRankings[gym][uid].count += 1;
    });

    // 객체를 배열로 변환하고 정렬
    const sortedRankings = Object.keys(gymRankings).map(gym => {
      const users = Object.values(gymRankings[gym])
        .sort((a, b) => b.count - a.count)
        .slice(0, limitPerGym);
      
      return {
        gym,
        topUsers: users
      };
    });

    return sortedRankings;
  } catch (error) {
    console.error("Ranking fetch error:", error);
    return [];
  }
};
