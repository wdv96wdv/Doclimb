import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getRecords } from "../../services/record";
import { getProfile } from "../../services/profile";
import { Activity, CheckCircle2, XCircle, ChevronRight, Inbox, Plus, Globe } from "lucide-react";
import Calendar from "../../components/Calendar/Calendar";
import Loading from "../../components/Common/Loading";
import PageStatus from "../../components/Common/PageStatus";
import styles from "./Records.module.css";

import { 
  getDifficultyColor, 
  getDifficultyEmoji, 
  groupByDate, 
  difficultyOrder,
  difficultyColors
} from "../../utils/climbingUtils";

// 통계 요약 계산 함수 (여기서만 쓰이는 특화 로직이므로 유지하되 유틸 사용)
const getSummary = (records) => {
  const successful = records.filter(r => r.success);
  const summary = successful.reduce((acc, r) => {
    acc[r.difficulty] = (acc[r.difficulty] || 0) + 1;
    return acc;
  }, {});

  const order = Object.keys(difficultyOrder).sort((a, b) => difficultyOrder[a] - difficultyOrder[b]);
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
  const [loading, setLoading] = useState(true);

  const displayName = profile?.display_nickname || user?.user_metadata?.name || user?.user_metadata?.full_name || "클라이머";

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [recordsData, profileData] = await Promise.all([
        getRecords(),
        getProfile(user.id),
      ]);
      setAllRecords(recordsData);
      setRecordsByDate(groupByDate(recordsData));
      setProfile(profileData);
    } catch {
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) {
    return <Loading message="기록을 불러오고 있습니다..." />;
  }

  if (error) {
    return (
      <PageStatus error={error} loading={false} onRetry={fetchData} />
    );
  }

  // 통계 데이터 계산
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyRecords = allRecords.filter(r => r.date.startsWith(currentMonth));

  const overallSummary = getSummary(allRecords);
  const monthlySummary = getSummary(monthlyRecords);
  const totalSuccessCount = allRecords.filter(r => r.success).length;
  const monthSuccessCount = monthlyRecords.filter(r => r.success).length;

  // 최고 레벨 색상 계산
  const getHighestColor = () => {
    const successfulRecords = allRecords.filter(r => r.success);
    if (successfulRecords.length === 0) return "#5271ff";

    const highest = successfulRecords.reduce((prev, curr) => {
      const prevLevel = difficultyOrder[prev.difficulty] || 0;
      const currLevel = difficultyOrder[curr.difficulty] || 0;
      return currLevel > prevLevel ? curr : prev;
    }, { difficulty: "-" });

    return getDifficultyColor(highest.difficulty);
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
                          <div className={styles.recordLocationWrapper}>
                            <span className={styles.recordLocation}>
                              {record.location}
                            </span>
                            {record.is_public && (
                              <div className={styles.publicBadge} title="명예의 전당 공개됨">
                                <Globe size={12} />
                                <span>명예의 전당</span>
                              </div>
                            )}
                          </div>
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
