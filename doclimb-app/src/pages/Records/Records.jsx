import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecords } from "../../services/record";
import Calendar from "../../components/calendar/Calendar";
import styles from "./Records.module.css";

const groupByDate = (records) => {
  return records.reduce((acc, r) => {
    const date = r.date.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(r);
    return acc;
  }, {});
};

function Records() {
  const [allRecords, setAllRecords] = useState([]);
  const [recordsByDate, setRecordsByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState("");

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

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.feed}>
        {/* Header */}
        <div className={styles.header}>
          <h2>기록</h2>
          <Link
            to={selectedDate ? `/records/new?date=${selectedDate}` : "/records/new"}
            className={styles.addButton}
          >
            추가
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
        {selectedDate && (
          <div className={styles.recordSection}>
            <h4 className={styles.selectedDate}>{selectedDate}</h4>

            {recordsByDate[selectedDate]?.length > 0 ? (
              <ul className={styles.recordList}>
                {recordsByDate[selectedDate].map((record) => (
                  <li key={record.id} className={styles.recordCard}>
                    <Link to={`/records/${record.id}`}>
                      <div className={styles.recordTop}>
                        <span className={styles.recordLocation}>
                          {record.location}
                        </span>
                        <span className={styles.recordDate}>
                          {record.date.split("T")[0]}
                        </span>
                      </div>

                      <div className={styles.recordBottom}>
                        <span>{record.climb_type}</span>
                        <span>{record.difficulty}</span>
                        <span
                          className={
                            record.success
                              ? styles.success
                              : styles.failure
                          }
                        >
                          {record.success ? "성공" : "실패"}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>기록 없음</p>
            )}
          </div>
        )}

        {!selectedDate && allRecords.length === 0 && (
          <p className={styles.empty}>
            아직 기록이 없습니다. 첫 기록을 추가해보세요!
          </p>
        )}
      </div>
    </div>
  );
}

export default Records;
