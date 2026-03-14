export const difficultyOrder = {
  "흰색": 1, "주황": 2, "노랑": 3, "초록": 4, "파랑": 5, 
  "남색": 6, "빨강": 7, "보라": 8, "회색": 9, "갈색": 10, 
  "검정색": 11, "핑크색": 12
};

export const difficultyColors = {
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

export const difficultyEmojis = {
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

export const getHighestDifficulty = (records) => {
  if (!records || records.length === 0) return "-";
  
  const successfulRecords = records.filter(r => r.success);
  if (successfulRecords.length === 0) return "-";

  return successfulRecords.reduce((prev, curr) => {
    const prevLevel = difficultyOrder[prev.difficulty] || 0;
    const currLevel = difficultyOrder[curr.difficulty] || 0;
    return currLevel > prevLevel ? curr : prev;
  }, { difficulty: "-" }).difficulty;
};

export const groupByDate = (records) => {
  return records.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(record);
    return acc;
  }, {});
};

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getDifficultyColor = (difficulty) => difficultyColors[difficulty] || "#5271ff";
export const getDifficultyEmoji = (difficulty) => difficultyEmojis[difficulty] || "🧗";
