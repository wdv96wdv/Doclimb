import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../context/AuthContext";
import { updateGymStatus } from "../../services/gym";

export function GymList() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  // --- 상태 관리 추가 ---
  const [searchTerm, setSearchTerm] = useState(""); // 이름/지역 검색
  const [statusFilter, setStatusFilter] = useState("all"); // 상태 필터 (전체/여유/보통 등)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const fetchGyms = async () => {
    try {
      const { data, error } = await supabase
        .from("gyms")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      setGyms(data || []);
    } catch (err) {
      console.error("데이터 로드 에러:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGyms();
    const subscription = supabase
      .channel("gym-updates")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "gyms" }, (payload) => {
        setGyms((current) =>
          current.map((gym) => (gym.id === payload.new.id ? payload.new : gym))
        );
      })
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, []);

  // --- 핵심: 필터링 로직 ---
  const filteredGyms = useMemo(() => {
    return gyms.filter((gym) => {
      const matchesSearch = 
        gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gym.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" || gym.current_status === parseInt(statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [gyms, searchTerm, statusFilter]);

  // 필터가 바뀔 때마다 페이지를 1페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // --- 페이징 계산 ---
  const totalPages = Math.ceil(filteredGyms.length / ITEMS_PER_PAGE);
  const currentItems = filteredGyms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleStatusChange = async (gymId, newStatus) => {
    try {
      await updateGymStatus(gymId, newStatus);
    } catch (err) {
      alert("권한이 없거나 오류가 발생했습니다.");
    }
  };

  const getStatusInfo = (status) => {
    const map = {
      0: { label: "여유", color: "#10b981" },
      1: { label: "보통", color: "#f59e0b" },
      2: { label: "혼잡", color: "#f97316" },
      3: { label: "매우 혼잡", color: "#ef4444" },
    };
    return map[status ?? 0] || { label: "정보 없음", color: "#9ca3af" };
  };

  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '12px', marginTop: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      
      {/* --- 필터 섹션 --- */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input 
          type="text"
          placeholder="암장 이름 또는 지역 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 2, padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
        />
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', background: 'white' }}
        >
          <option value="all">전체 상태</option>
          <option value="0">여유 🟢</option>
          <option value="1">보통 🟡</option>
          <option value="2">혼잡 🟠</option>
          <option value="3">매우 혼잡 🔴</option>
        </select>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>불러오는 중...</p>
        ) : currentItems.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>검색 결과가 없습니다.</p>
        ) : (
          currentItems.map((gym) => {
            const status = getStatusInfo(gym.current_status);
            return (
              <div key={gym.id} style={{ border: '1px solid #f0f0f0', padding: '16px', borderRadius: '12px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', color: '#1f2937' }}>{gym.name}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>{gym.location}</p>
                  </div>
                  <span style={{ backgroundColor: status.color, color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: '800' }}>
                    {status.label}
                  </span>
                </div>

                {isAdmin && (
                  <div style={{ marginTop: '12px', display: 'flex', gap: '4px', borderTop: '1px solid #f9fafb', paddingTop: '10px' }}>
                    {[0, 1, 2, 3].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleStatusChange(gym.id, num)}
                        style={{
                          flex: 1, padding: '6px 0', fontSize: '11px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #e5e7eb',
                          backgroundColor: gym.current_status === num ? '#3b82f6' : '#fff',
                          color: gym.current_status === num ? '#fff' : '#4b5563',
                        }}
                      >
                        {getStatusInfo(num).label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* --- 페이징 컨트롤 --- */}
      {filteredGyms.length > ITEMS_PER_PAGE && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '25px' }}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={navBtnStyle(currentPage === 1)}>이전</button>
          <span style={{ fontSize: '14px', color: '#666' }}>{currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={navBtnStyle(currentPage === totalPages)}>다음</button>
        </div>
      )}
    </div>
  );
}

const navBtnStyle = (disabled) => ({
  padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0',
  backgroundColor: disabled ? '#f8fafc' : '#fff',
  color: disabled ? '#cbd5e0' : '#4a5568',
  cursor: disabled ? 'not-allowed' : 'pointer'
});

export default GymList;