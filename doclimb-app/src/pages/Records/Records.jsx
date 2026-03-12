import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecords } from "../../services/record";
import { useAuth } from "../../context/AuthContext";
import Calendar from "../../components/calendar/Calendar";
import { MapPin, Activity, Trophy, ChevronRight, CheckCircle2, XCircle, Inbox } from "lucide-react";
import styles from "./Records.module.css";

const groupByDate = (records) => {
  return records.reduce((acc, r) => {
    const date = r.date.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(r);
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
    "빨강": "#ff0000",
    "보라": "#8a2be2",
    "회색": "#808080",
    "갈색": "#8b4513",
    "검정색": "#000000",
    "무지개색": "linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)"
  };
  return colors[difficulty] || "#5271ff";
};

function Records() {
  const { user } = useAuth();
  const [allRecords, setAllRecords] = useState([]);
  const [recordsByDate, setRecordsByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState("");

  const displayName = user?.user_metadata?.name || user?.user_metadata?.full_name || "클라이머";

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await getRecords();
        setAllRecords(data);
        setRecordsByDate(groupByDate(data));
      } catch (err) {
        setError("기록을 불러오는데 실패했습니다.");
      }
    };

    fetchRecords();
  }, []);

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
        {/* Header */}
        <div className={styles.header}>
          <h2>{displayName}의 기록</h2>
          <Link
            to={selectedDate ? `/records/new?date=${selectedDate}` : "/records/new"}
            className={styles.addButton}
          >
            새 기록 추가
          </Link>
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
              <h4 className={styles.selectedDate}>{selectedDate}의 기록</h4>
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
                                  color: getDifficultyColor(record.difficulty)
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
