//我的：资料卡+我参与的（关键词搜索、越新越上
import { useEffect, useState } from 'react'
import Avatar from '../../components/Avatar'
import {
  EXP_PER_LEVEL,
  PARTICIPATION_STATUS_TEXT,
  getMe,
  getMyParticipations,
} from '../../mock/profile'
import type { MeProfile, ParticipationItem } from '../../mock/profile'
import styles from './index.module.css'
import logoImg from '../../assets/brand/logo-trim.png'
import decoQuote from '../../assets/brand/deco1.png'

export default function Profile() {
  const [me, setMe] = useState<MeProfile | null>(null)
  const [items, setItems] = useState<ParticipationItem[]>([])
  const [keyword, setKeyword] = useState('')
  const [error, setError] = useState('')
  const [listLoading, setListLoading] = useState(true)

  //资料只取一次
  useEffect(() => {
    let cancelled = false
    getMe()
      .then((profile) => {
        if (!cancelled) setMe(profile)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : '资料加载失败')
      })
    return () => {
      cancelled = true
    }
  }, [])

  //搜索词一变就重新查
  useEffect(() => {
    let cancelled = false
    setListLoading(true)
    getMyParticipations(keyword)
      .then((list) => {
        if (!cancelled) setItems(list)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : '记录加载失败')
      })
      .finally(() => {
        if (!cancelled) setListLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [keyword])

  //进度条百分比 本级经验/50
  const progress = me ? (me.level_progress / EXP_PER_LEVEL) * 100 : 0

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1 className={styles.title}>我的</h1>
        <img className={styles.logo} src={logoImg} alt="" aria-hidden="true" />
      </header>

      <section className={styles.card}>
        <img
          className={`${styles.decoCorner} ${styles.decoCornerLeft}`}
          src={decoQuote}
          alt=""
          aria-hidden="true"
        />
        <img
          className={`${styles.decoCorner} ${styles.decoCornerRight}`}
          src={decoQuote}
          alt=""
          aria-hidden="true"
        />
        <Avatar avatar={me?.avatar} size={64} />
        <div className={styles.meta}>
          <p className={styles.nickname}>{me?.nickname ?? '…'}</p>
          <p className={styles.level}>等级：{me?.level ?? 0}</p>
          <div className={styles.progress}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <p className={styles.progressText}>
            {me ? `${me.level_progress}/${EXP_PER_LEVEL}` : `0/${EXP_PER_LEVEL}`}
          </p>
        </div>
      </section>

      <div className={styles.searchWrap}>
        {/*<img className={styles.decoQuote} src={decoQuote} alt="" aria-hidden="true" />*/}
        <input
          className={styles.search}
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="输入关键词搜索"
          aria-label="搜索我参与过的海螺"
          enterKeyHint="search"
        />
      </div>

      <section className={styles.listArea}>
        {error && <p className={styles.error}>{error}</p>}
        {listLoading ? (
          <p className={styles.empty}>正在打捞…</p>
        ) : items.length === 0 ? (
          <p className={styles.empty}>没有找到相关的海螺</p>
        ) : (
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.id} className={styles.item}>
                <span className={styles.itemText}>{item.description}</span>
                <span className={`${styles.badge} ${styles[item.status]}`}>
                  {PARTICIPATION_STATUS_TEXT[item.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}