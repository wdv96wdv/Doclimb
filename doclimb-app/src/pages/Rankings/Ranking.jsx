import { useEffect, useState } from "react";
import { fetchGymRankings } from "../../services/gamification";
import { Trophy, Medal, Award, MapPin, User, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Ranking.module.css";
import defaultAvatar from "../../assets/img/No_Image_Available.jpg";

function Ranking() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const loadRankings = async () => {
      const data = await fetchGymRankings();
      setRankings(data);
      setLoading(false);
    };
    loadRankings();
  }, []);

  const totalPages = Math.ceil(rankings.length / ITEMS_PER_PAGE);
  const currentRankings = rankings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
        {currentRankings.length > 0 ? (
          currentRankings.map((group, idx) => (
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
                      src={user.avatar || defaultAvatar} 
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

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className={styles.pageBtn}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`${styles.numberBtn} ${currentPage === num ? styles.active : ''}`}
              >
                {num}
              </button>
            ))}
          </div>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className={styles.pageBtn}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export default Ranking;
