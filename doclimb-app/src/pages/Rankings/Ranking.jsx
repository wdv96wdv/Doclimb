import { useEffect, useState } from "react";
import { fetchGymRankings } from "../../services/gamification";
import { Trophy, Medal, Award, MapPin, User, Loader2 } from "lucide-react";
import styles from "./Ranking.module.css";

function Ranking() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRankings = async () => {
      const data = await fetchGymRankings();
      setRankings(data);
      setLoading(false);
    };
    loadRankings();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} />
        <p>암장별 랭킹 로드 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <Trophy className={styles.mainIcon} size={40} />
          <h2>암장별 명예의 전당</h2>
        </div>
        <p>우리 암장의 완등 왕은 누구일까요? (월간 기준)</p>
      </header>

      <div className={styles.rankingGrid}>
        {rankings.length > 0 ? (
          rankings.map((group, idx) => (
            <div key={idx} className={styles.gymCard}>
              <div className={styles.gymHeader}>
                <MapPin size={18} />
                <h3>{group.gym}</h3>
              </div>
              
              <div className={styles.userList}>
                {group.topUsers.map((user, uIdx) => (
                  <div key={uIdx} className={styles.userRow}>
                    <div className={styles.rankBadge}>
                      {uIdx === 0 ? <Trophy size={16} color="#ffd700" /> : 
                       uIdx === 1 ? <Medal size={16} color="#c0c0c0" /> :
                       <Award size={16} color="#cd7f32" />}
                      <span>{uIdx + 1}</span>
                    </div>
                    
                    <img 
                      src={user.avatar || "/climbing_placeholder.jpg"} 
                      alt={user.nickname} 
                      className={styles.avatar}
                    />
                    
                    <div className={styles.userInfo}>
                      <span className={styles.nickname}>{user.nickname}</span>
                      <span className={styles.score}>{user.count}회 완등</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.empty}>
            <p>아직 랭킹 데이터가 부족합니다.<br/>첫 등반을 기록하고 암장의 주인공이 되어보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Ranking;
