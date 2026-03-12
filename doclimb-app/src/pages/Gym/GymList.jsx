import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../context/AuthContext";
import { updateGymStatus } from "../../services/gym";
import { Search, MapPin, ChevronLeft, ChevronRight, Info } from "lucide-react";
import styles from "./GymList.module.css";

export function GymList() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>실시간 암장 혼잡도</h2>
          <p>쾌적한 등반을 위해 주변 암장의 상태를 확인해보세요.</p>
        </div>
        
        <div className={styles.filterBar}>
          <div style={{ position: 'relative', flex: 2 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input 
              type="text"
              placeholder="암장 이름 또는 지역 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              style={{ paddingLeft: '44px' }}
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.statusSelect}
          >
            <option value="all">전체 상태</option>
            <option value="0">여유 🟢</option>
            <option value="1">보통 🟡</option>
            <option value="2">혼잡 🟠</option>
            <option value="3">매우 혼잡 🔴</option>
          </select>
        </div>

        <div className={styles.gymGrid}>
          {loading ? (
            <div className={styles.emptyState}>데이터를 불러오는 중입니다...</div>
          ) : currentItems.length === 0 ? (
            <div className={styles.emptyState}>
              <Info size={48} strokeWidth={1} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p>검색 결과가 없습니다.</p>
            </div>
          ) : (
            currentItems.map((gym) => {
              const status = getStatusInfo(gym.current_status);
              return (
                <div key={gym.id} className={styles.gymCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.gymInfo}>
                      <h3>{gym.name}</h3>
                      <p><MapPin size={14} className="inline mr-1" /> {gym.location}</p>
                    </div>
                    <span className={styles.statusBadge} style={{ backgroundColor: status.color }}>
                      {status.label}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className={styles.adminControls}>
                      {[0, 1, 2, 3].map((num) => (
                        <button
                          key={num}
                          onClick={() => handleStatusChange(gym.id, num)}
                          className={`${styles.adminBtn} ${gym.current_status === num ? styles.active : ""}`}
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

        {filteredGyms.length > ITEMS_PER_PAGE && (
          <div className={styles.pagination}>
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)} 
              className={styles.navBtn}
            >
              <ChevronLeft size={20} />
            </button>
            <span className={styles.pageInfo}>{currentPage} / {totalPages}</span>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(p => p + 1)} 
              className={styles.navBtn}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GymList;