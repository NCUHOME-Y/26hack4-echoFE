//我的：资料卡+我参与的（关键词搜索、越新越上
import { useEffect, useState } from 'react'
import Avatar from '../../components/Avatar'
import AvatarPicker from '../../components/AvatarPicker'
import {
  EXP_PER_LEVEL,
  PARTICIPATION_STATUS_TEXT,
  getMe,
  getMyParticipations,
  participationStatus,
  updateAvatar,
} from '../../mock/profile'
import type { MeProfile, AnswerItem } from '../../mock/profile'
import styles from './index.module.css'
import logoImg from '../../assets/brand/logo-trim.png'
import decoPair from '../../assets/brand/deco2.png'

export default function Profile() {
  const [me, setMe] = useState<MeProfile | null>(null)
  const [items, setItems] = useState<AnswerItem[]>([])
  const [keyword, setKeyword] = useState('')
  const [error, setError] = useState('')
  const [listLoading, setListLoading] = useState(true)
  const [pickerOpen, setPickerOpen] = useState(false)

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
        <img className={styles.decoPair} src={decoPair} alt="" aria-hidden="true" />
        <button
          type="button"
          className={styles.avatarButton}
          onClick={() => setPickerOpen(true)}
          aria-label="更换头像"
        >
          <Avatar avatar={me?.avatar} size={64} />
        </button>

        <div className={styles.meta}>
          <p className={styles.nickname}>{me?.nickname ?? '…'}</p>
          <p className={styles.account}>@{me?.account ?? '—'}</p>
          
          <div className={styles.progress}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <p className={styles.level}>
            {me ? `lv${Math.min(me.level, 9999)} ${me.level_progress}/${EXP_PER_LEVEL}` : 'lv— —/50'}
          </p>
        </div>
      </section>

      <div className={styles.searchWrap}>
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
      <div className={styles.sandTop} aria-hidden="true" />

      <AvatarPicker
        open={pickerOpen}
        value={me?.avatar}
        onClose={() => setPickerOpen(false)}
        onConfirm={async (avatar) => {
          await updateAvatar(avatar)
          setMe((prev) => (prev ? { ...prev, avatar } : prev))
        }}
      />

      <section className={styles.listArea}>
        {error && <p className={styles.error}>{error}</p>}
        {listLoading ? (
          <p className={styles.empty}>正在打捞…</p>
        ) : items.length === 0 ? (
          <p className={styles.empty}>没有找到相关的海螺</p>
        ) : (
          <ul className={styles.list}>
  {items.map((item) => {
    const status = participationStatus(item)
    return (
      <li key={item.question_id} className={styles.item}>
        <span className={styles.itemText}>{item.description}</span>
        <span className={`${styles.badge} ${styles[status]}`}>
          {PARTICIPATION_STATUS_TEXT[status]}
        </span>
      </li>
    )
  })}
          </ul>
        )}
      </section>
      <div className={styles.sandBottom} aria-hidden="true" />
    </div>
  )
}