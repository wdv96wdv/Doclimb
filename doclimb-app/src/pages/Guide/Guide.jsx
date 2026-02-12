import React, { useState } from "react";
import styles from "./Guide.module.css";

const DATA = {
  hold: [
    { 
      name: "저그 (Jug)", 
      desc: "손가락 전체로 움켜쥘 수 있는 크고 깊은 홀드입니다.", 
      howTo: "손바닥 전체를 밀착시켜 안정적으로 잡으세요.", 
      emoji: "✊",
      difficulty: "하"
    },
    { 
      name: "크림프 (Crimp)", 
      desc: "손가락 첫 마디만 걸리는 아주 얇고 작은 홀드입니다.", 
      howTo: "손가락을 모아 세워 잡거나 엄지로 검지를 눌러 지지하세요.", 
      emoji: "🤏",
      difficulty: "상"
    },
    { 
      name: "슬로퍼 (Sloper)", 
      desc: "각이 없고 둥글어 잡을 곳이 마땅치 않은 홀드입니다.", 
      howTo: "마찰력을 극대화하기 위해 손바닥 전체로 감싸듯 눌러야 합니다.", 
      emoji: "🖐️",
      difficulty: "중~상"
    },
    { 
      name: "핀치 (Pinch)", 
      desc: "엄지와 나머지 손가락으로 집게처럼 잡는 홀드입니다.", 
      howTo: "양옆에서 강하게 꼬집는 힘(지력)을 이용하세요.", 
      emoji: "🦀",
      difficulty: "중"
    },
    { 
      name: "포켓 (Pocket)", 
      desc: "홀드에 하나 이상의 구멍이 뚫려 있는 형태입니다.", 
      howTo: "구멍 크기에 따라 손가락 1~3개를 넣어 고정하세요.", 
      emoji: "🕳️",
      difficulty: "중~상"
    },
    { 
      name: "언더 (Undercling)", 
      desc: "잡는 방향이 아래로 향해 있는 홀드입니다.", 
      howTo: "손바닥을 위로 향하게 하여 몸 쪽으로 당기며 일어나세요.", 
      emoji: "⤴️",
      difficulty: "중"
    }
  ],
  move: [
    { name: "플래깅 (Flagging)", desc: "한쪽 다리를 벽에 대어 무게 중심을 잡는 가장 기초적인 기술입니다.", emoji: "🚩" },
    { name: "힐훅 (Heel Hook)", desc: "발뒤꿈치를 홀드 위나 옆에 걸어 몸을 끌어당깁니다.", emoji: "🦶" },
    { name: "토훅 (Toe Hook)", desc: "발등을 홀드에 걸어 몸이 벽에서 떨어지지 않게 버팁니다.", emoji: "👟" },
    { name: "드롭 니 (Drop Knee)", desc: "한쪽 무릎을 아래로 꺾어 골반을 벽에 밀착시키는 기술입니다.", emoji: "📐" },
    { name: "다이노 (Dyno)", desc: "반동을 이용해 다음 홀드로 점프하듯 이동하는 역동적 동작입니다.", emoji: "🚀" }
  ]
};

function Guide() {
  const [activeTab, setActiveTab] = useState("hold");

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Climbing A to Z 🧗</h1>
        <p className={styles.subtitle}>클라이밍 입문을 위한 홀드와 기술 완벽 가이드</p>
      </header>

      <div className={styles.tabGroup}>
        <button 
          className={`${styles.tabBtn} ${activeTab === "hold" ? styles.active : ""}`}
          onClick={() => setActiveTab("hold")}
        >
          홀드 가이드
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "move" ? styles.active : ""}`}
          onClick={() => setActiveTab("move")}
        >
          등반 기술
        </button>
      </div>

      <div className={styles.grid}>
        {DATA[activeTab].map((item, idx) => (
          <div key={idx} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.emoji}>{item.emoji}</span>
              {item.difficulty && <span className={styles.level}>난이도: {item.difficulty}</span>}
            </div>
            <h3 className={styles.cardTitle}>{item.name}</h3>
            <p className={styles.cardDesc}>{item.desc}</p>
            
            {activeTab === "hold" && (
              <div className={styles.howToBox}>
                <strong>💡 잡는 법:</strong> {item.howTo}
              </div>
            )}
          </div>
        ))}
      </div>

      <section className={styles.infoSection}>
        <h3>알아두면 좋은 클라이밍 에티켓</h3>
        <ul className={styles.etiquetteList}>
          <li>🧗 한 벽에는 한 사람만! 등반 경로가 겹치지 않게 주의하세요.</li>
          <li>👏 다른 클라이머가 등반 중일 때는 매트 아래에서 대기하세요.</li>
          <li>🧹 사용한 홀드에 초크가 너무 많이 묻었다면 브러쉬로 털어주세요.</li>
        </ul>
      </section>
    </div>
  );
}

export default Guide;