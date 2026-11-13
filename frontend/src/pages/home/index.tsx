// 海滩or首页
import { useState, useEffect } from 'react'
import styles from './index.module.css'

export default function Home() {
const [nickname, setNickname] = useState('');

useEffect(() => {
  const storedNickname = sessionStorage.getItem('echo_nickname');
  if (storedNickname) {
    setNickname(storedNickname);
  } 
}, []);

  return (
    <div className={styles.page}>
      <h1>首页{nickname}</h1>
    </div>
  );
}