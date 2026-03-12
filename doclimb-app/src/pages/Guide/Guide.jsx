import React, { useState } from "react";
import styles from "./Guide.module.css";
import { Lightbulb, Info, ShieldCheck, HeartPulse, Droplets } from "lucide-react";

// 이미지 임포트는 기존 코드와 동일하게 유지
import hold1 from "../../assets/img/hold1.png";
import hold2 from "../../assets/img/hold2.png";
import hold3 from "../../assets/img/hold3.png";
import hold4 from "../../assets/img/hold4.png";
import hold5 from "../../assets/img/hold5.png";
import hold6 from "../../assets/img/hold6.png";
import hold7 from "../../assets/img/hold7.png";
import move1 from "../../assets/img/move1.jpg";
import move2 from "../../assets/img/move2.jpg";
import move3 from "../../assets/img/move3.jpg";
import move4 from "../../assets/img/move4.jpg";
import move5 from "../../assets/img/move5.jpg";

const DATA = {
  hold: [
    {
      name: "저그 (Jug)",
      img: hold1,
      desc: "손가락 전체로 움켜쥘 수 있는 크고 깊은 홀드입니다.",
      howTo: "손바닥 전체를 밀착시켜 안정적으로 잡으세요.",
      difficulty: "하"
    },
    {
      name: "크림프 (Crimp)",
      img: hold7,
      desc: "손가락 첫 마디만 걸리는 아주 얇고 작은 홀드입니다.",
      howTo: "손가락을 모아 세워 잡거나 엄지로 검지를 눌러 지지하세요.",
      difficulty: "상"
    },
    {
      name: "슬로퍼 (Sloper)",
      img: hold3,
      desc: "각이 없고 둥글어 잡을 곳이 마땅치 않은 홀드입니다.",
      howTo: "마찰력을 극대화하기 위해 손바닥 전체로 감싸듯 눌러야 합니다.",
      difficulty: "중~상"
    },
    {
      name: "핀치 (Pinch)",
      img: hold4,
      desc: "엄지와 나머지 손가락으로 집게처럼 잡는 홀드입니다.",
      howTo: "양옆에서 강하게 꼬집는 힘(지력)을 이용하세요.",
      difficulty: "중"
    },
    {
      name: "포켓 (Pocket)",
      img: hold2,
      desc: "홀드에 하나 이상의 구멍이 뚫려 있는 형태입니다.",
      howTo: "구멍 크기에 따라 손가락 1~3개를 넣어 고정하세요.",
      difficulty: "중~상"
    },
    {
      name: "언더 (Undercling)",
      img: hold5,
      desc: "잡는 방향이 아래로 향해 있는 홀드입니다.",
      howTo: "손바닥을 위로 향하게 하여 몸 쪽으로 당기며 일어나세요.",
      difficulty: "중"
    }
  ],
  move: [
    { name: "플래깅 (Flagging)", desc: "한쪽 다리를 벽에 대어 무게 중심을 잡는 가장 기초적인 기술입니다.", img: move1, difficulty: "하" },
    { name: "힐훅 (Heel Hook)", desc: "발뒤꿈치를 홀드 위나 옆에 걸어 몸을 끌어당깁니다.", img: move2, difficulty: "중" },
    { name: "토훅 (Toe Hook)", desc: "발등을 홀드에 걸어 몸이 벽에서 떨어지지 않게 버팁니다.", img: move4, difficulty: "중~상" },
    { name: "드롭 니 (Drop Knee)", desc: "한쪽 무릎을 아래로 꺾어 골반을 벽에 밀착시키는 기술입니다.", img: move3, difficulty: "중" },
    { name: "다이노 (Dyno)", desc: "반동을 이용해 다음 홀드로 점프하듯 이동하는 역동적 동작입니다.", img: move5, difficulty: "상" }
  ]
};

function Guide() {
  const [activeTab, setActiveTab] = useState("hold");

  const getLevelClass = (lv) => {
    if (!lv) return styles.medium;
    if (lv === "하") return styles.easy;
    if (lv.includes("상")) return styles.hard;
    return styles.medium;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Climbing A to Z</h1>
        <p className={styles.subtitle}>Doclimb이 제안하는 완벽 등반 가이드</p>
      </header>

      <div className={styles.tabGroup}>
        <button className={`${styles.tabBtn} ${activeTab === "hold" ? styles.active : ""}`} onClick={() => setActiveTab("hold")}>홀드 가이드</button>
        <button className={`${styles.tabBtn} ${activeTab === "move" ? styles.active : ""}`} onClick={() => setActiveTab("move")}>등반 기술</button>
      </div>

      <div className={styles.grid}>
        {DATA[activeTab].map((item, idx) => (
          <div key={idx} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img src={item.img} alt={item.name} className={styles.cardImage} />
              <div className={`${styles.levelBadge} ${getLevelClass(item.difficulty)}`}>
                {item.difficulty}
              </div>
            </div>

            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{item.name}</h3>
              <p className={styles.cardDesc}>{item.desc}</p>

              {activeTab === "hold" && (
                <div className={styles.howToBox}>
                  <span className={styles.howToTitle}>
                    <Lightbulb size={14} /> 잡는 법
                  </span>
                  <p>{item.howTo}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <section className={styles.infoSection}>
        <h3 className={styles.infoTitle}>암장 가기 전, 이것만은 챙기세요!</h3>
        <div className={styles.etiquetteGrid}>
          <div className={styles.etiquetteItem}>
            <div className={styles.etiIcon}><ShieldCheck size={28} /></div>
            <div>
              <strong>스킨 케어</strong>
              <p>손톱은 짧게 깎고, 상처가 있다면 테이핑을 준비하세요.</p>
            </div>
          </div>
          <div className={styles.etiquetteItem}>
            <div className={styles.etiIcon}><HeartPulse size={28} /></div>
            <div>
              <strong>충분한 스트레칭</strong>
              <p>부상 방지를 위해 손가락과 어깨 예열은 필수입니다.</p>
            </div>
          </div>
          <div className={styles.etiquetteItem}>
            <div className={styles.etiIcon}><Droplets size={28} /></div>
            <div>
              <strong>수분 보충</strong>
              <p>강도 높은 운동인 만큼 충분한 물을 챙겨가세요.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Guide;