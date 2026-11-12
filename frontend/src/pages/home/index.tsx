// src/pages/Beach/index.tsx
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
      <h1>🏖️ 欢迎来到海滩主页！{nickname}</h1>
    </div>
  );
}