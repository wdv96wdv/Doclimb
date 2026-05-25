import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import { getRecords } from "../../services/record";
import { useAuth } from "../../context/AuthContext";
import { getUserBadges, fetchGymRankings } from "../../services/gamification";
import { getHighestDifficulty } from "../../utils/climbingUtils";
import Loading from "../../components/Common/Loading";
import { 
  Activity, ShieldCheck, UserCheck, Settings, Map, BarChart3, 
  ChevronRight, Zap, Trophy, Footprints, Flame, Medal, Award, Sparkles 
} from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayName = user?.user_metadata?.name || user?.user_metadata?.full_name || "클라이머";

  const [weeklyStats, setWeeklyStats] = useState({ count: 0, topGrade: "-" });
  const [recentBadges, setRecentBadges] = useState([]);
  const [rankPreview, setRankPreview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        setError("");
        return;
      }

      try {
        setLoading(true);
        setError("");
        // 1. 등반 기록 통계
        const records = await getRecords();
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const filtered = records.filter(r => new Date(r.date) >= firstDayOfMonth);
        
        setWeeklyStats({
          count: filtered.length,
          topGrade: getHighestDifficulty(filtered)
        });

        // 2. 최근 뱃지 (3개)
        const badges = await getUserBadges(user.id);
        setRecentBadges(badges.slice(0, 3));

        // 3. 랭킹 프리뷰
        const rankings = await fetchGymRankings(3);
        setRankPreview(rankings.slice(0, 1));

      } catch (err) {
        console.error("데이터 로딩 에러:", err);
        setError("대시보드 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (user && loading) {
    return (
      <div className={styles.homeContainer}>
        <Loading message="대시보드를 불러오고 있습니다..." />
      </div>
    );
  }

  const getBadgeIcon = (iconType) => {
    const props = { size: 18 };
    switch (iconType) {
      case 'Footprints': return <Footprints {...props} />;
      case 'Trophy': return <Trophy {...props} />;
      case 'Map': return <Map {...props} />;
      case 'Flame': return <Flame {...props} />;
      default: return <Award {...props} />;
    }
  };

  return (
    <div className={styles.homeContainer}>
      {/* 1. Hero Section */}
      <section className={`${styles.heroSection} ${user ? styles.userMode : styles.guestMode}`}>
        <div className={styles.heroContentWrapper}>
          {user ? (
            /* 로그인 시: 대시보드 뷰 */
            <div className={`${styles.dashboardHero} ${styles.animateFadeInUp}`}>
              {error && (
                <p className={styles.dashboardError} role="alert">
                  {error}
                </p>
              )}
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

              {/* 뱃지 위젯 */}
              {recentBadges.length > 0 && (
                <div className={styles.recentBadgesWidget}>
                  <div className={styles.widgetHeader}>
                    <span>최근 획득 뱃지</span>
                    <button onClick={() => navigate("/mypage")}>전체보기</button>
                  </div>
                  <div className={styles.badgeRow}>
                    {recentBadges.map((item, idx) => (
                      <div key={idx} className={styles.miniBadgeCard}>
                        {getBadgeIcon(item.badges.icon_type)}
                        <span className={styles.miniBadgeName}>{item.badges.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 비로그인 시: 프리미엄 랜딩 뷰 */
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

      {/* 2. 랭킹 프리뷰 (로그인 시에만 노출) */}
      {user && rankPreview.length > 0 && (
        <section className={styles.rankingPreviewSection}>
          <div className={styles.contentWrapper}>
            <div className={styles.rankingCard} onClick={() => navigate("/ranking")}>
              <div className={styles.rankCardLeft}>
                <div className={styles.rankTag}><Sparkles size={12} /> Live Ranking</div>
                <h3>{rankPreview[0].gym} 명예의 전당</h3>
                <p>지금 우리 암장은 이 분들이 휩쓸고 있어요!</p>
              </div>
              <div className={styles.rankCardRight}>
                {rankPreview[0].topUsers.map((u, i) => (
                  <div key={i} className={styles.miniRankUser}>
                    <img src={u.avatar || "/climbing_placeholder.jpg"} alt={u.nickname} />
                    {i === 0 && <Trophy size={14} className={styles.firstIcon} />}
                  </div>
                ))}
                <ChevronRight size={20} className={styles.arrowIcon} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. AI 분석 홍보 (비로그인 시에도 서비스 정체를 알 수 있게 함) */}
      <section className={styles.aiPromotionSection}>
        <div className={styles.contentWrapper}>
          <div className={styles.aiBannerCard}>
            <div className={styles.aiBannerText}>
              <span className={styles.newBadge}>AI Coach</span>
              <h2>데이터 기반의 성장을 경험하세요</h2>
              <p>기록된 기록을 AI가 분석하여 당신의 강점과 약점을 시각화해 드립니다.</p>
              <button onClick={() => navigate("/login")} className={styles.aiButton}>
                무료 분석 시작하기 <ChevronRight size={18} />
              </button>
            </div>
            <div className={styles.aiBannerImage}>
              <Activity size={120} strokeWidth={1} />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Quick Access */}
      <section className={styles.shortcutSection}>
        <div className={styles.contentWrapper}>
          <div className={`${styles.shortcutGrid} ${styles.animateFadeInUp}`}>
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

      {/* 5. Culture & Etiquette */}
      <section className={styles.cultureSection}>
        <div className={styles.contentWrapper}>
          <div className={styles.sectionHeader}>
            <h3>모두를 위한 클라이밍 매너</h3>
            <p>안전하고 즐거운 등반 환경은 우리 스스로 만듭니다.</p>
          </div>

          <div className={`${styles.etiquetteGrid} ${styles.animateFadeInUp}`}>
            <div className={styles.etiquetteCard}>
              <UserCheck size={28} className={styles.etiIcon} />
              <h4>경로 간섭 주의</h4>
              <p>루트가 겹치지 않는지 등반 전 반드시 확인하세요.</p>
            </div>
            <div className={styles.etiquetteCard}>
              <ShieldCheck size={28} className={styles.etiIcon} />
              <h4>안전 거리 유지</h4>
              <p>매트 위는 추락 사고 위험이 있습니다. 거리를 지켜주세요.</p>
            </div>
            <div className={styles.etiquetteCard}>
              <Zap size={28} className={styles.etiIcon} />
              <h4>초크 매너</h4>
              <p>과도한 초크 사용은 피하고 매너를 지켜주세요.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
