import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import Swal from "sweetalert2";
import styles from "./AdminUsers.module.css";

function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      // 검색어가 있을 경우 filter 추가
      let query = supabase
        .from("profiles")
        .select(`*, memberships(id, type, end_date, status)`);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMembership = async (userId, type, days) => {
    const { isConfirmed } = await Swal.fire({
      title: `${type} 부여`,
      html: `해당 유저의 이용 기간을 <b>${days}일</b> 연장하시겠습니까?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3182ce',
      confirmButtonText: '확인',
      cancelButtonText: '취소'
    });

    if (!isConfirmed) return;

    Swal.fire({ title: '처리 중...', didOpen: () => Swal.showLoading() });

    try {
      const { data: existing } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      let startDate = new Date();
      let endDate = new Date();

      if (existing) {
        const currentEndDate = new Date(existing.end_date);
        startDate = currentEndDate;
        endDate = new Date(currentEndDate);
        endDate.setDate(currentEndDate.getDate() + days);
        await supabase.from('memberships').update({ status: 'extended' }).eq('id', existing.id);
      } else {
        endDate.setDate(startDate.getDate() + days);
      }

      await supabase.from('memberships').insert([{
        user_id: userId, type,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'active'
      }]);

      Swal.fire({ icon: 'success', title: '완료!', timer: 1000, showConfirmButton: false });
      fetchAllUsers();
    } catch (err) {
      Swal.fire('오류', err.message, 'error');
    }
  };

  const handleRemoveMembership = async (userId) => {
    const { isConfirmed } = await Swal.fire({
      title: '이용권 회수',
      text: "현재 활성화된 이용권을 정말로 취소하시겠습니까? (만료일이 오늘로 조정됩니다)",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53e3e',
      confirmButtonText: '회수하기',
      cancelButtonText: '취소'
    });

    if (!isConfirmed) return;

    try {
      const { error } = await supabase
        .from('memberships')
        .update({ status: 'cancelled', end_date: new Date().toISOString().split('T')[0] })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;
      Swal.fire({ icon: 'success', title: '회수 완료', timer: 1000, showConfirmButton: false });
      fetchAllUsers();
    } catch (err) {
      Swal.fire('에러', err.message, 'error');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>👥 유저 및 이용권 관리</h2>
        <p className={styles.subtitle}>회원들의 이용 권한을 실시간으로 관리합니다.</p>
      </header>

      <div className={styles.searchSection}>
        <form className={styles.searchForm} onSubmit={(e) => { e.preventDefault(); fetchAllUsers(); }}>
          <input
            className={styles.input}
            type="text"
            placeholder="이름 또는 이메일 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className={styles.primaryBtn}>검색</button>
        </form>
        <button onClick={() => {setSearchTerm(""); fetchAllUsers();}} className={styles.refreshBtn}>
          🔄 목록 초기화
        </button>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.theadRow}>
              <th className={styles.th}>회원 정보</th>
              <th className={styles.th}>현재 상태</th>
              <th className={styles.th}>관리 액션</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const activeMember = user.memberships?.find(m => m.status === 'active');
              return (
                <tr key={user.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.userName}>{user.name}</div>
                    <div className={styles.userEmail}>{user.email}</div>
                  </td>
                  <td className={styles.td}>
                    {activeMember ? (
                      <div className={`${styles.badge} ${styles.badgeActive}`}>
                        {activeMember.type} (~{activeMember.end_date})
                      </div>
                    ) : (
                      <div className={`${styles.badge} ${styles.badgeNone}`}>이용권 없음</div>
                    )}
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actionBtnGroup}>
                      <button onClick={() => handleUpdateMembership(user.id, "1개월권", 30)} className={`${styles.actionBtn} ${styles.btnBlue}`}>+30일</button>
                      <button onClick={() => handleUpdateMembership(user.id, "1일권", 1)} className={`${styles.actionBtn} ${styles.btnGray}`}>+1일</button>
                      
                      {/* 직접 입력 버튼 */}
                      <button
                        onClick={async () => {
                          const { value: days } = await Swal.fire({
                            title: '커스텀 연장',
                            input: 'number',
                            inputLabel: '연장할 일수를 입력하세요',
                            inputValue: 1,
                            showCancelButton: true,
                          });
                          if (days) handleUpdateMembership(user.id, "기타연장", parseInt(days));
                        }}
                        className={`${styles.actionBtn} ${styles.btnLightGray}`}
                      >
                        입력
                      </button>

                      {/* 회수 버튼: 이용권이 있을 때만 노출 */}
                      {activeMember && (
                        <button onClick={() => handleRemoveMembership(user.id)} className={styles.removeBtn} title="이용권 회수">
                          ❌
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;