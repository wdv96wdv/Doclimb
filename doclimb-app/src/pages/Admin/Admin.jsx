import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import AdminCongestion from "./AdminCongestion";
import AdminUsers from "./AdminUsers";
import styles from "./Admin.module.css";
import AdminAddGym from "./AdminAddGym";

function Admin() {
    const navigate = useNavigate();

    return (
        <div className={styles.adminContainer}>
            <nav className={styles.sidebar}>
                <div className={styles.menuTitle}>ADMIN PANEL</div>

                <NavLink
                    to="/admin/congestion"
                    className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}
                >
                    📊 혼잡도 설정
                </NavLink>

                <NavLink
                    to="/admin/users"
                    className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}
                >
                    👥 유저/이용권 관리
                </NavLink>

                <NavLink
                    to="/admin/add-gym"
                    className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}
                >
                    <span style={{ fontSize: '18px' }}>🏢</span> 암장 등록
                </NavLink>

                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                    <button
                        onClick={() => navigate('/')}
                        className={styles.navLink}
                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        🏠 메인으로 돌아가기
                    </button>
                </div>
            </nav>

            <main className={styles.content}>
                <Routes>
                    <Route path="/" element={<div style={{ padding: '40px' }}><h2>관리자 대시보드</h2><p>메뉴를 선택해주세요.</p></div>} />
                    <Route path="congestion" element={<AdminCongestion />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="add-gym" element={<AdminAddGym />} />
                </Routes>
            </main>
        </div>
    );
}

export default Admin;