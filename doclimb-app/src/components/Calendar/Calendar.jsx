import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./calendar.module.css"; // Assume a CSS module for styling

const Calendar = ({ recordsByDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    const numDays = lastDay.getDate();

    const days = [];
    for (let i = 1; i <= numDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = daysInMonth[0].getDay(); // 0 for Sunday, 1 for Monday, etc.

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const handleDayClick = (day) => {
    setSelectedDay(day.getDate());
    onSelectDate(day); // Pass the full day object to the parent
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  };

  const hasRecords = (day) => {
    const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    return recordsByDate && recordsByDate[dateKey] && recordsByDate[dateKey].length > 0;
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHeader}>
        <div className={styles.dateDisplay}>
          <span className={styles.yearText}>{currentMonth.getFullYear()}년</span>
          <h2 className={styles.monthText}>{currentMonth.getMonth() + 1}월</h2>
        </div>
        <div className={styles.navButtons}>
          <button onClick={handlePrevMonth} aria-label="이전 달">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} aria-label="다음 달">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className={styles.weekdays}>
        <span>일</span>
        <span>월</span>
        <span>화</span>
        <span>수</span>
        <span>목</span>
        <span>금</span>
        <span>토</span>
      </div>
      <div className={styles.daysGrid}>
        {[...Array(firstDayOfMonth)].map((_, i) => (
          <div key={`empty-start-${i}`} className={styles.emptyDay} />
        ))}
        {daysInMonth.map((day) => (
          <div
            key={day.toISOString()}
            className={`${styles.day} ${isToday(day) ? styles.today : ""} ${selectedDay === day.getDate() ? styles.selected : ""} ${hasRecords(day) ? styles.hasRecords : ""}`}
            onClick={() => handleDayClick(day)}
          >
            <span className={styles.dayNumber}>{day.getDate()}</span>
            {hasRecords(day) && <div className={styles.recordIndicator} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;