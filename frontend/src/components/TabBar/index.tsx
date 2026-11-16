// 底部导航栏
import { NavLink, useNavigate } from 'react-router-dom'
import styles from './index.module.css'
import homeIcon from '../../assets/TabBar/home.png'
import debateIcon from '../../assets/TabBar/debate.png'
import askIcon from '../../assets/TabBar/ask.png'
import shellIcon from '../../assets/TabBar/shell.png'
import profileIcon from '../../assets/TabBar/profile.png'
import homeActiveIcon from '../../assets/TabBar/home-active.png'
import debateActiveIcon from '../../assets/TabBar/debate-active.png'
import shellActiveIcon from '../../assets/TabBar/shell-active.png'
import profileActiveIcon from '../../assets/TabBar/profile-active.png'


export default function TabBar() {
  const navigate = useNavigate()

  return (
    <nav className={styles.bar}>
      <NavLink
        to="/home"
        className={({ isActive }) => (isActive ? `${styles.item} ${styles.active}` : styles.item)}
      >
        <span className={styles.iconBox}>
          <img className={styles.icon} src={homeIcon} alt="" />
          <img className={styles.iconActive} src={homeActiveIcon} alt="" />
        </span>
        <span className={styles.label}>海滩</span>
      </NavLink>

      <NavLink
        to="/debate"
        className={({ isActive }) => (isActive ? `${styles.item} ${styles.active}` : styles.item)}
      >
        <span className={styles.iconBox}>
          <img className={styles.icon} src={debateIcon} alt="" />
          <img className={styles.iconActive} src={debateActiveIcon} alt="" />
        </span>
        <span className={styles.label}>争议</span>
        
      </NavLink>

      <button type="button" className={styles.ask} onClick={() => navigate('/ask')} aria-label="提问">
        <img className={styles.askIcon} src={askIcon} alt="" />
      </button>

      <NavLink
        to="/shell"
        className={({ isActive }) => (isActive ? `${styles.item} ${styles.active}` : styles.item)}
      >
        <span className={styles.iconBox}>
          <img className={styles.icon} src={shellIcon} alt="" />
          <img className={styles.iconActive} src={shellActiveIcon} alt="" />
        </span>
        <span className={styles.label}>海螺</span>
        
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => (isActive ? `${styles.item} ${styles.active}` : styles.item)}
      >
        <span className={styles.iconBox}>
          <img className={styles.icon} src={profileIcon} alt="" />
          <img className={styles.iconActive} src={profileActiveIcon} alt="" />
        </span>
        <span className={styles.label}>我的</span>
        
      </NavLink>
    </nav>
  )
}
