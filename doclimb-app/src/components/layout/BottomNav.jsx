import { NavLink } from "react-router-dom";
import styles from "./BottomNav.module.css";

function BottomNav() {
  return (
    <nav className={styles.nav}>
      <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ""}>
        🏠
        <span>홈</span>
      </NavLink>

      <NavLink to="/records" className={({ isActive }) => isActive ? styles.active : ""}>
        🧗
        <span>기록</span>
      </NavLink>

      <NavLink to="/records/new" className={styles.add}>
        ➕
      </NavLink>

      <NavLink to="/mypage" className={({ isActive }) => isActive ? styles.active : ""}>
        👤
        <span>마이</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;
