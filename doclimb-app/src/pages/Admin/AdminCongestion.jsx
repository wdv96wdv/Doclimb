import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import Swal from "sweetalert2";
import styles from "./AdminCongestion.module.css";

function AdminCongestion() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // 검색 및 필터 상태 추가
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); 
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchGyms();
  }, [currentPage, statusFilter]); // 필터 변경 시에도 다시 불러옴

  const fetchGyms = async () => {
    setLoading(true);
    try {
      // 1. 기본 쿼리 생성
      let query = supabase.from("gyms").select("*", { count: "exact" });

      // 2. 이름 검색 조건 추가
      if (searchTerm.trim()) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      // 3. 상태 필터 조건 추가
      if (statusFilter !== "all") {
        query = query.eq("current_status", parseInt(statusFilter));
      }

      // 4. 페이징 처리
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, count, error } = await query
        .order("name", { ascending: true })
        .range(from, to);

      if (error) throw error;

      setGyms(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("데이터 로드 실패:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 검색 버튼 클릭 시 (1페이지부터 다시 검색)
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchGyms();
  };

  const handleStatusUpdate = async (gymId, status) => {
    try {
      const { error } = await supabase
        .from("gyms")
        .update({ current_status: status, last_updated: new Date().toISOString() })
        .eq("id", gymId);

      if (error) throw error;
      
      Swal.fire({ icon: "success", title: "업데이트 완료", timer: 1000, showConfirmButton: false });
      fetchGyms();
    } catch (err) {
      Swal.fire("오류", err.message, "error");
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className={styles.container}>
      <header style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800' }}>📊 혼잡도 설정</h2>
        <p style={{ color: '#718096' }}>각 지점의 실시간 혼잡도를 검색하고 관리하세요.</p>
      </header>

      {/* 검색 및 필터 바 섹션 */}
      <div style={filterSectionStyle}>
        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="암장 이름으로 검색..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={searchBtnStyle}>검색</button>
        </form>

        <select 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          style={selectStyle}
        >
          <option value="all">전체 상태</option>
          <option value="0">여유</option>
          <option value="1">보통</option>
          <option value="2">혼잡</option>
          <option value="3">매우혼잡</option>
        </select>

        <button onClick={() => { setSearchTerm(""); setStatusFilter("all"); setCurrentPage(1); }} style={refreshBtnStyle}>
          초기화
        </button>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.theadRow}>
              <th className={styles.th}>암장 정보</th>
              <th className={styles.th}>현재 상태</th>
              <th className={styles.th}>상태 변경</th>
            </tr>
          </thead>
          <tbody>
            {gyms.length > 0 ? gyms.map((gym) => (
              <tr key={gym.id} className={styles.tr}>
                <td className={styles.td}>
                  <div style={{ fontWeight: '700', color: '#2d3748' }}>{gym.name}</div>
                  <div style={{ fontSize: '12px', color: '#718096' }}>{gym.location}</div>
                </td>
                <td className={styles.td}>
                  {renderStatusBadge(gym.current_status)}
                </td>
                <td className={styles.td}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {[0, 1, 2, 3].map((s) => (
                      <button 
                        key={s}
                        onClick={() => handleStatusUpdate(gym.id, s)}
                        style={statusBtnStyle(gym.current_status === s, s)}
                      >
                        {s === 0 ? "여유" : s === 1 ? "보통" : s === 2 ? "혼잡" : "매우혼잡"}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#a0aec0' }}>
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이징 UI (이전과 동일) */}
      <div className={styles.pagination}>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className={styles.pageBtn}>이전</button>
        <span style={{ fontWeight: '700', color: '#4a5568' }}>{currentPage} / {totalPages || 1}</span>
        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} className={styles.pageBtn}>다음</button>
      </div>
    </div>
  );
}

// --- 스타일링 (AdminUsers와 통일) ---
const filterSectionStyle = { display: 'flex', gap: '12px', marginBottom: '25px', alignItems: 'center' };
const inputStyle = { flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' };
const searchBtnStyle = { padding: '12px 24px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' };
const selectStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#4a5568', fontWeight: '500', outline: 'none', cursor: 'pointer' };
const refreshBtnStyle = { padding: '12px 16px', backgroundColor: '#edf2f7', border: 'none', borderRadius: '10px', color: '#4a5568', cursor: 'pointer', fontWeight: '500' };

const renderStatusBadge = (status) => {
  const colors = ["#48bb78", "#ecc94b", "#ed8936", "#e53e3e"];
  const labels = ["여유", "보통", "혼잡", "매우혼잡"];
  return (
    <span style={{ padding: '6px 12px', backgroundColor: `${colors[status]}22`, color: colors[status], borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
      {labels[status]}
    </span>
  );
};

const statusBtnStyle = (isActive, status) => {
  const colors = ["#48bb78", "#ecc94b", "#ed8936", "#e53e3e"];
  return {
    padding: '6px 12px', fontSize: '11px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #e2e8f0',
    backgroundColor: isActive ? colors[status] : 'white',
    color: isActive ? 'white' : '#4a5568',
    transition: 'all 0.2s', fontWeight: isActive ? '700' : '400'
  };
};

export default AdminCongestion;