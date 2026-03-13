import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getRecords } from "../../services/record";
import { getProfile } from "../../services/profile";
import { Activity, CheckCircle2, XCircle, ChevronRight, Inbox, Plus } from "lucide-react";
import Calendar from "../../components/Calendar/Calendar";
import styles from "./Records.module.css";

// 날짜별로 그룹화하는 헬퍼 함수
const groupByDate = (records) => {
  return records.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(record);
    return acc;
  }, {});
};

// 난이도별 색상 매핑 함수
const getDifficultyColor = (difficulty) => {
  const colors = {
    "흰색": "#FFFFFF",
    "주황": "#ff8c00",
    "노랑": "#ffd700",
    "초록": "#32cd32",
    "파랑": "#1e90ff",
    "남색": "#04203aff",
    "빨강": "#ff0000",
    "보라": "#8a2be2",
    "회색": "#808080",
    "갈색": "#8b4513",
    "검정색": "#000000",
    "핑크색": "#eb0cc5ff"
  };
  return colors[difficulty] || "#5271ff";
};

// 난이도별 이모지 매핑
const getDifficultyEmoji = (difficulty) => {
  const emojis = {
    "흰색": "🤍",
    "주황": "🧡",
    "노랑": "💛",
    "초록": "💚",
    "파랑": "💙",
    "남색": "🌑",
    "빨강": "❤️",
    "보라": "💜",
    "회색": "🩶",
    "갈색": "🤎",
    "검정색": "🖤",
    "핑크색": "🩷"
  };
  return emojis[difficulty] || "🧗";
};

// 통계 요약 계산 함수
const getSummary = (records) => {
  const successful = records.filter(r => r.success);
  const summary = successful.reduce((acc, r) => {
    acc[r.difficulty] = (acc[r.difficulty] || 0) + 1;
    return acc;
  }, {});

  const order = ["흰색", "주황", "노랑", "초록", "파랑", "남색", "빨강", "보라", "회색", "갈색", "검정색", "핑크색"];
  return order
    .filter(diff => summary[diff])
    .map(diff => ({ label: diff, count: summary[diff], emoji: getDifficultyEmoji(diff) }));
};

function Records() {
  const { user } = useAuth();
  const [allRecords, setAllRecords] = useState([]);
  const [recordsByDate, setRecordsByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  const displayName = profile?.display_nickname || user?.user_metadata?.name || user?.user_metadata?.full_name || "클라이머";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordsData, profileData] = await Promise.all([
          getRecords(),
          getProfile(user.id)
        ]);
        setAllRecords(recordsData);
        setRecordsByDate(groupByDate(recordsData));
        setProfile(profileData);
      } catch (err) {
        setError("데이터를 불러오는데 실패했습니다.");
      }
    };

    if (user) fetchData();
  }, [user]);

  // 통계 데이터 계산
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyRecords = allRecords.filter(r => r.date.startsWith(currentMonth));

  const overallSummary = getSummary(allRecords);
  const monthlySummary = getSummary(monthlyRecords);
  const totalSuccessCount = allRecords.filter(r => r.success).length;
  const monthSuccessCount = monthlyRecords.filter(r => r.success).length;

  // 최고 레벨 색상 계산
  const getHighestColor = () => {
    const order = ["흰색", "주황", "노랑", "초록", "파랑", "남색", "빨강", "보라", "회색", "갈색", "검정색", "핑크색"];
    const successfulRecords = allRecords.filter(r => r.success);
    if (successfulRecords.length === 0) return "#5271ff"; // 기본색 (보라/파랑 계열)
    
    let highestIdx = -1;
    successfulRecords.forEach(r => {
      const idx = order.indexOf(r.difficulty);
      if (idx > highestIdx) highestIdx = idx;
    });
    
    return highestIdx === -1 ? "#5271ff" : getDifficultyColor(order[highestIdx]);
  };

  const highestColor = getHighestColor();
  const isLight = highestColor === "#FFFFFF" || highestColor === "#ffd700";
  const avatarTextColor = isLight ? "#000" : "#fff";
  const levelGlow = `${highestColor}66`; // 40% 투명도

  const handleSelectDate = (date) => {
    const dateKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    setSelectedDate(dateKey);
  };

  if (error) return (
    <div className={styles.page}>
      <div className={styles.feed}>
        <div className={styles.error}>{error}</div>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.feed}>
        {/* Profile Header */}
        <div 
          className={styles.profileHeader} 
          style={{ 
            '--user-level-color': highestColor,
            '--avatar-text-color': avatarTextColor,
            '--level-glow': levelGlow
          }}
        >
          <div className={styles.avatar}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className={styles.avatarImg} />
            ) : (
              displayName.slice(0, 1).toUpperCase()
            )}
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.username}>{displayName}님</h2>
            {/* <p className={styles.bio}>오늘도 한 걸음 더 높이</p> */}
          </div>
          <div className={styles.actionWrapper}>
            <Link
              to={selectedDate ? `/records/new?date=${selectedDate}` : "/records/new"}
              className={styles.addButton}
            >
              <Plus size={20} /> 기록 추가
            </Link>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className={styles.statsDashboard}>
          <div className={styles.statCard} title="완등 성공 시에만 통계에 집계됩니다">
            <span className={styles.statLabel}>전체 완등</span>
            <span className={styles.statValue}>{totalSuccessCount}</span>
            <div className={styles.statSummary}>
              {overallSummary.slice(0, 3).map(s => (
                <span key={s.label}>{s.emoji}x{s.count}</span>
              ))}
              {overallSummary.length > 3 && <span>...</span>}
            </div>
          </div>
          <div className={styles.statCard} title="이번 달 성공 기록 요약입니다">
            <span className={styles.statLabel}>이번 달 성과</span>
            <span className={styles.statValue}>{monthSuccessCount}</span>
            <div className={styles.statSummary}>
              {monthlySummary.length > 0 ? (
                monthlySummary.slice(0, 3).map(s => (
                  <span key={s.label}>{s.emoji}x{s.count}</span>
                ))
              ) : (
                <span className={styles.noData}>기록 없음</span>
              )}
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>총 기록수</span>
            <span className={styles.statValue}>{allRecords.length}</span>
            <span className={styles.statSubText}>건</span>
          </div>
        </div>

        {/* Calendar */}
        <div className={styles.calendarWrapper}>
          <Calendar
            recordsByDate={recordsByDate}
            onSelectDate={handleSelectDate}
          />
        </div>

        {/* Records */}
        <div className={styles.recordSection}>
          {selectedDate ? (
            <>
              <div className={styles.dateHeader}>
                <h4 className={styles.selectedDate}>{selectedDate} 성과</h4>
                <div className={styles.dateSummary}>
                  {getSummary(recordsByDate[selectedDate] || []).map(s => (
                    <span key={s.label} className={styles.summaryBadge}>
                      {s.emoji} x {s.count}
                    </span>
                  ))}
                </div>
              </div>

              {recordsByDate[selectedDate]?.length > 0 ? (
                <ul className={styles.recordList}>
                  {recordsByDate[selectedDate].map((record) => (
                    <li key={record.id} className={styles.recordCard}>
                      <Link to={`/records/${record.id}`}>
                        <div className={styles.cardMainInfo}>
                          <span className={styles.recordLocation}>
                            {record.location}
                          </span>
                          <div className={styles.recordMeta}>
                            <div className={styles.metaItem}>
                              <Activity size={14} />
                              <span>{record.climb_type}</span>
                            </div>
                            <div className={styles.difficultyBadge}>
                              <div
                                className={styles.colorDot}
                                style={{
                                  background: getDifficultyColor(record.difficulty),
                                  boxShadow: `0 0 8px ${getDifficultyColor(record.difficulty)}44`
                                }}
                              />
                              <span>{record.difficulty}</span>
                            </div>
                          </div>
                        </div>

                        <div className={styles.cardRightInfo}>
                          <div className={`${styles.successStatus} ${record.success ? styles.success : styles.failure}`}>
                            {record.success ? (
                              <><CheckCircle2 size={18} /> <span>완등</span></>
                            ) : (
                              <><XCircle size={18} /> <span>연습</span></>
                            )}
                          </div>
                          <ChevronRight size={20} color="#a0a5b1" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.empty}>
                  <Inbox size={48} strokeWidth={1} />
                  <p>이날의 기록이 아직 없네요. <br />멋진 등반을 추가해보세요!</p>
                </div>
              )}
            </>
          ) : (
            allRecords.length === 0 ? (
              <div className={styles.empty}>
                <Inbox size={48} strokeWidth={1} />
                <p>아직 기록이 없습니다. <br />첫 기록을 추가하고 성장을 확인해보세요!</p>
              </div>
            ) : (
              <div className={styles.empty}>
                <p>위 달력에서 날짜를 선택하여 <br />상세 기록을 확인해보세요.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Records;
