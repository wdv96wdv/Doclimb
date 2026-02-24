import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import { getRecords } from "../../services/record";
import { useAuth } from "../../context/AuthContext";
import heroBackground from "../../assets/img/jemogu.jpg";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // ... 생략 (summary fetch 로직은 그대로 유지) ...

  return (
    <div className={styles.homeContainer}>
      {/* 1. Hero: 서비스의 핵심 가치 */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground} style={{ backgroundImage: `url(${heroBackground})` }}></div>
        <div className={styles.heroContent}>
          <h1>당신의 등반을<br />데이터로 기록하세요</h1>
          <p>어제보다 더 높은 곳을 향하는 당신을 위해<br />DoClimb이 모든 여정을 함께합니다.</p>
          <button onClick={() => navigate("/records/new")} className={styles.ctaButton}>
            오늘의 등반 기록하기
          </button>
        </div>
      </section>

      {/* 2. Quick Access: 실시간 정보 및 기록 (가이드 제거) */}
      <section className={styles.shortcutSection}>
        <div className={styles.contentWrapper}>
          <div className={styles.shortcutGrid}>
            <div className={styles.shortcutCard} onClick={() => navigate("/gymlist")}>
              <div className={styles.icon}>🏙️</div>
              <h3>실시간 암장 현황</h3>
              <p>현재 가장 쾌적한 암장을 찾아보세요.</p>
            </div>
            <div className={styles.shortcutCard} onClick={() => navigate("/records")}>
              <div className={styles.icon}>📊</div>
              <h3>나의 성장 궤적</h3>
              <p>지난 기록을 분석하고 목표를 설정하세요.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Learning Banner: 가이드 페이지로 유도 (대형 배너) */}
      <section className={styles.guideHighlight}>
        <div className={styles.contentWrapper}>
          <div className={styles.guideContent}>
            <span className={styles.tag}>Learning Center</span>
            <h2>홀드를 잡는 법부터 기술까지</h2>
            <p>크림프를 잡을 때 손가락이 아프신가요? <br />초보 클라이머가 꼭 알아야 할 필수 테크닉을 정리했습니다.</p>
            <button onClick={() => navigate("/guide")} className={styles.outlineButton}>
              가이드북 펼쳐보기
            </button>
          </div>
        </div>
      </section>

      {/* 4. Etiquette & Culture: 새로운 가치 전달 */}
      <section className={styles.cultureSection}>
        <div className={styles.contentWrapper}>
          <div className={styles.cultureBox}>
            <div className={styles.cultureText}>
              <h3>매너가 클라이머를 만든다 🤝</h3>
              <p>클라이밍장은 모두가 함께 사용하는 공간입니다. <br />기본적인 에티켓을 지키며 즐겁게 등반하세요.</p>
            </div>
            <div className={styles.etiquetteList}>
              <div className={styles.etiquetteItem}>🚩 한 벽에는 한 사람만</div>
              <div className={styles.etiquetteItem}>🧹 사용한 홀드 브러쉬질</div>
              <div className={styles.etiquetteItem}>❌ 매트 위에는 올라가지 않기</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;