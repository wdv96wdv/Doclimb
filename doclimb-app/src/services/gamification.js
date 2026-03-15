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

    // 통계 계산용 변수들
    const now = new Date();
    const stats = {
      totalSuccess: 0,
      hasEarly: false,
      hasLate: false,
      gymSet: new Set(),
      gymVisitCounts: {},
      recentAttendance: new Set(),
      weeklyActivity: {}, // { weekNumber: Set([0, 6]) }
      maxGrade: 0,
      dailyGrades: {}, // { date: [grades] }
      maxSingleSession: 0,
      dailySuccessCounts: {},
      hasFail: false
    };

    const difficultyOrder = {
      "흰색": 1, "주황": 2, "노랑": 3, "초록": 4, "파랑": 5,
      "남색": 6, "빨강": 7, "보라": 8, "회색": 9, "갈색": 10,
      "검정색": 11, "핑크색": 12
    };

    // 헬퍼: 주차 계산
    const getWeekNumber = (d) => {
      const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
      const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
      return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    };

    records.forEach(record => {
      const recordDate = new Date(record.date);
      const day = recordDate.getDay(); // 0:일, 6:토
      const dateStr = record.date;
      
      // 1. 시간대 체크 (created_at 기준)
      if (record.created_at) {
        const hour = new Date(record.created_at).getHours();
        if (hour < 7) stats.hasEarly = true;
        if (hour >= 22) stats.hasLate = true;
      }

      // 2. 완등 및 난이도 체크
      if (record.success) {
        stats.totalSuccess++;
        const grade = difficultyOrder[record.difficulty] || 0;
        if (grade > stats.maxGrade) stats.maxGrade = grade;

        // 일일 최고 난이도 집계
        if (!stats.dailyGrades[dateStr]) stats.dailyGrades[dateStr] = [];
        stats.dailyGrades[dateStr].push(grade);
        
        // 단일 세션(하루) 최대 완등 수
        const dailyCount = (stats.dailySuccessCounts[dateStr] || 0) + 1;
        stats.dailySuccessCounts[dateStr] = dailyCount;
        if (dailyCount > stats.maxSingleSession) stats.maxSingleSession = dailyCount;
      } else {
        stats.hasFail = true;
      }

      // 3. 암장 및 출석 체크
      if (record.location) {
        stats.gymSet.add(record.location);
        stats.gymVisitCounts[record.location] = (stats.gymVisitCounts[record.location] || 0) + 1;
      }
      
      // 최근 30일 출석 체크용
      const diffDays = (now - recordDate) / (1000 * 60 * 60 * 24);
      if (diffDays <= 30) stats.recentAttendance.add(dateStr);

      // 주말 스트릭 체크용
      const weekNum = getWeekNumber(recordDate);
      if (!stats.weeklyActivity[weekNum]) stats.weeklyActivity[weekNum] = new Set();
      if (day === 0 || day === 6) stats.weeklyActivity[weekNum].add(day);
    });

    // 5. 커뮤니티 활동 조회 (댓글 수)
    const { count: commentCount } = await supabase
      .from('community_comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // 6. 조건 체크 및 지급
    const newlyEarned = [];

    for (const badge of unearnedBadges) {
      let isMet = false;
      const val = badge.requirement_value;
      
      switch (badge.requirement_type) {
        case 'total_count':
          if (records.length >= val) isMet = true;
          break;
        case 'total_success':
          if (stats.totalSuccess >= val) isMet = true;
          break;
        case 'gym_count':
          if (stats.gymSet.size >= val) isMet = true;
          break;
        case 'time_early':
          if (stats.hasEarly) isMet = true;
          break;
        case 'time_late':
          if (stats.hasLate) isMet = true;
          break;
        case 'weekend_streak':
          // 한 주에 토(6)와 일(0)이 모두 포함된 사례가 있는지
          isMet = Object.values(stats.weeklyActivity).some(days => days.has(0) && days.has(6));
          break;
        case 'monthly_attendance':
          if (stats.recentAttendance.size >= val) isMet = true;
          break;
        case 'max_grade':
          // 난이도 매핑: 주황(V1)부터 시작한다고 가정
          // 1:흰색, 2:주황(V1), 3:노랑(V2)... 4:초록(V3)... 5:파랑(V4)... 6:남색... 7:빨강(V5)
          // 쿼리에서 requirement_value로 준 값을 difficultyOrder와 매칭 (V1=2, V2=3, V3=4, V4=5, V5=7 등으로 조정 필요할 수 있음)
          // 일단 단순 매핑: V-Grade + 1 ≒ difficultyOrder
          const gradeThreshold = val + 1; 
          if (stats.maxGrade >= gradeThreshold) isMet = true;
          break;
        case 'daily_high_difficulty':
          // 하루에 최고 난이도(본인 기준 or 특정 기준) 3개 이상
          isMet = Object.values(stats.dailyGrades).some(grades => 
            grades.filter(g => g >= stats.maxGrade - 1).length >= val
          );
          break;
        case 'single_gym_count':
          isMet = Object.values(stats.gymVisitCounts).some(count => count >= val);
          break;
        case 'comment_count':
          if (commentCount >= val) isMet = true;
          break;
        case 'single_session_count':
          if (stats.maxSingleSession >= val) isMet = true;
          break;
        case 'first_fail_log':
          if (stats.hasFail) isMet = true;
          break;
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
      .eq('success', true)
      .eq('is_public', true);

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
