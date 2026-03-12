import { NavLink } from "react-router-dom";
import { Home, ScrollText, PlusCircle, User } from "lucide-react";
import styles from "./BottomNav.module.css";

function BottomNav() {
  return (
    <nav className={styles.nav}>
      <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ""}>
        <Home size={20} />
        <span>홈</span>
      </NavLink>

      <NavLink to="/records" className={({ isActive }) => isActive ? styles.active : ""}>
        <ScrollText size={20} />
        <span>기록</span>
      </NavLink>

      <NavLink to="/records/new" className={({ isActive }) => isActive ? styles.active : ""}>
        <PlusCircle size={20} />
        <span>추가</span>
      </NavLink>

      <NavLink to="/mypage" className={({ isActive }) => isActive ? styles.active : ""}>
        <User size={20} />
        <span>마이</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;
