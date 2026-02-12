import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './Header.module.css'; // Import the CSS module
import logo from '../../assets/img/mainlogo4.png';
function Header() {
  const { isAuthenticated, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo} onClick={() => navigate("/")}>
        <img src={logo} alt="DoClimb Logo" className={styles.logoImage} />
      </div>

      <nav className={styles.nav}>
        {isAuthenticated ? (
          <>
            <button className={styles.navButton} onClick={() => navigate("/gymlist")}>실시간 암장 혼잡도</button>
            <button className={styles.navButton} onClick={() => navigate("/records")}>기록</button>
            <button className={styles.navButton} onClick={() => navigate("/community")}>커뮤니티</button>
            <button className={styles.navButton} onClick={() => navigate("/guide")}>가이드</button>
            <button className={styles.navButton} onClick={() => navigate("/mypage")}>마이페이지</button>
            <button className={styles.navButton} onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <button className={styles.navButton} onClick={() => navigate("/login")}>로그인</button>
        )}
      </nav>
    </header>
  );
}

export default Header;
