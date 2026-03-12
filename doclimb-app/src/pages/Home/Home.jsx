import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import { getRecords } from "../../services/record";
import { useAuth } from "../../context/AuthContext";
// Lucide react icons for a clean, premium look instead of emojis
import { Activity, ShieldCheck, UserCheck, Settings, Map, BarChart3, ChevronRight, Zap } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 로그인 정보를 안전하게 추출 (Optional Chaining ?. 사용)
  const displayName = user?.user_metadata?.name || user?.user_metadata?.full_name || "클라이머";
  const profileImg = user?.user_metadata?.avatar_url;

  // 1. 상태 선언 (초기값 설정)
  const [weeklyStats, setWeeklyStats] = useState({
    count: 0,
    topGrade: "V0"
  });

  // 2. 데이터 가져오기 로직
  useEffect(() => {
    const fetchAndCalculateStats = async () => {
      if (!user) return;

      try {
        const records = await getRecords();

        // 2.  이번 달 기록 계산
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        firstDayOfMonth.setHours(0, 0, 0, 0);

        // 3. 이번 달 기록 필터링
        const filteredRecords = records.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= firstDayOfMonth;
        });

        // 4. 최고 난이도 계산 (색상 난이도 기준 변경)
        const difficultyOrder = {
          "흰색": 1,
          "주황": 2,
          "노랑": 3,
          "초록": 4,
          "파랑": 5,
          "빨강": 6,
          "보라": 7,
          "회색": 8,
          "갈색": 9
        };

        const highest = filteredRecords.reduce((prev, current) => {
          // 기존 V단위(V1, V2)가 섞여있을 수 있으므로 대응
          const parseDifficulty = (diff) => {
            if (!diff) return 0;
            if (difficultyOrder[diff]) return difficultyOrder[diff]; // 색상 매핑
            if (diff.startsWith('V')) return parseInt(diff.replace('V', '')) || 0; // 기존 V 난이도
            return 0;
          };

          const prevLevel = parseDifficulty(prev.difficulty);
          const currentLevel = parseDifficulty(current.difficulty);
          return currentLevel > prevLevel ? current : prev;
        }, { difficulty: "-" });

        // 5. 상태 업데이트
        setWeeklyStats({
          count: filteredRecords.length,
          topGrade: highest.difficulty || "-"
        });

      } catch (error) {
        console.error("통계 계산 중 오류:", error);
      }
    };

    fetchAndCalculateStats();
  }, [user]); // 유저가 변경될 때마다 다시 계산


  return (
    <div className={styles.homeContainer}>
      {/* 1. Hero Section */}
      <section className={`${styles.heroSection} ${user ? styles.userMode : styles.guestMode}`}>
        <div className={styles.heroContentWrapper}>
          {user ? (
            /* 🟢 로그인 리뉴얼: 글래스모피즘 대시보드 */
            <div className={`${styles.dashboardHero} ${styles.animateFadeInUp}`}>
              <div className={styles.welcomeText}>
                <h1>안녕하세요, {displayName}님!</h1>
                <p>오늘도 한 단계 더 성장할 준비가 되셨나요?</p>
              </div>

              <div className={styles.quickStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>이번 달 등반</span>
                  <span className={styles.statValue}>{weeklyStats.count}회</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>최고 난이도</span>
                  <span className={styles.statValue}>{weeklyStats.topGrade}</span>
                </div>
                <button onClick={() => navigate("/records/new")} className={styles.mainActionBtn}>
                  기록 추가하기
                </button>
              </div>
            </div>
          ) : (
            /* 🔴 비로그인 리뉴얼: 하이엔드 그라데이션 및 타이포그래피 */
            <div className={`${styles.landingHero} ${styles.animateFadeInUp}`}>
              <h1 className={styles.mainTitle}>
                Climb Higher,<br />
                <span className={styles.textGradient}>Record Smarter.</span>
              </h1>
              <p className={styles.subTitle}>
                당신의 등반 데이터를 정밀하게 기록하고<br />
                최적의 성장 경로를 분석해 드립니다.
              </p>
              <div className={styles.btnGroup}>
                <button onClick={() => navigate("/login")} className={styles.primaryBtn}>
                  시작하기
                </button>
                <button onClick={() => navigate("/guide")} className={styles.outlineBtn}>
                  기능 둘러보기
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ✨ 2. New Smart Analysis Highlight (기존 AI 코치 리뉴얼) */}
      <section className={styles.aiPromotionSection}>
        <div className={styles.contentWrapper}>
          <div className={`${styles.aiBannerCard} ${styles.animateFadeInUp} ${styles.delay1}`}>
            <div className={styles.aiBannerText}>
              <span className={styles.newBadge}>Smart Analysis</span>
              <h2>당신만을 위한 정밀 등반 분석 기능</h2>
              <p>
                단순한 기록을 넘어, 누적된 데이터를 기반으로 다음 목표 난이도와 최적화된 훈련 솔루션을 도출합니다.
              </p>
              <button
                onClick={() => navigate("/ai-coach")}
                className={styles.aiButton}
              >
                무료 분석 시작하기 <ChevronRight size={18} />
              </button>
            </div>
            <div className={styles.aiBannerImage}>
              <Activity className={styles.abstractIcon} size={80} strokeWidth={1} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Quick Access: Glassmorphism Cards */}
      <section className={styles.shortcutSection}>
        <div className={styles.contentWrapper}>
          <div className={`${styles.shortcutGrid} ${styles.animateFadeInUp} ${styles.delay2}`}>
            <div className={styles.shortcutCard} onClick={() => navigate("/gymlist")}>
              <div className={styles.iconWrapper}>
                <Map size={32} />
              </div>
              <h3>실시간 암장 현황</h3>
              <p>혼잡도를 확인하고 가장 쾌적한 암장을 선택하세요.</p>
            </div>
            <div className={styles.shortcutCard} onClick={() => navigate("/records")}>
              <div className={styles.iconWrapper}>
                <BarChart3 size={32} />
              </div>
              <h3>나의 성장 궤적</h3>
              <p>과거의 기록을 시각화하여 당신의 발전을 직접 확인하세요.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Learning Banner: 세련된 교육 배너 */}
      <section className={styles.guideHighlight}>
        <div className={styles.contentWrapper}>
          <div className={styles.guideContent}>
            <span className={styles.tag}>Learning Center</span>
            <h2>테크닉의 한 끗 차이가 완등을 만듭니다</h2>
            <p>올바른 그립법부터 코어 활용까지, 전문적인 클라이밍 지식을 당신의 기술로 만드세요.</p>
            <button onClick={() => navigate("/guide")} className={styles.outlineButton}>
              가이드북 살펴보기
            </button>
          </div>
        </div>
      </section>

      {/* 5. Etiquette & Culture: 매너 카드 리뉴얼 */}
      <section className={styles.cultureSection}>
        <div className={styles.contentWrapper}>
          <div className={styles.sectionHeader}>
            <h3>모두를 위한 클라이밍 매너</h3>
            <p>안전하고 즐거운 등반 환경은 우리 스스로 만듭니다.</p>
          </div>

          <div className={`${styles.etiquetteGrid} ${styles.animateFadeInUp} ${styles.delay3}`}>
            <div className={styles.etiquetteCard}>
              <div className={styles.etiIcon}>
                <UserCheck size={28} />
              </div>
              <h4>경로 간섭 주의</h4>
              <p>다른 클라이머와 루트가 겹치지 않는지 등반 전 반드시 확인하세요.</p>
            </div>
            <div className={styles.etiquetteCard}>
              <div className={styles.etiIcon}>
                <ShieldCheck size={28} />
              </div>
              <h4>안전 거리 유지</h4>
              <p>매트 위는 추락 사고 위험이 있습니다. 안전한 거리를 지켜주세요.</p>
            </div>
            <div className={styles.etiquetteCard}>
              <div className={styles.etiIcon}>
                <Zap size={28} />
              </div>
              <h4>초크 매너</h4>
              <p>과도한 초크 사용은 피하고, 공기가 너무 탁해지지 않도록 주의해주세요.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
