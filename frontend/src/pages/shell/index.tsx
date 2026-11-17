import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyQuestions } from '../../api/me'
import type { MyQuestion } from '../../api/me'
import styles from './index.module.css'
import decoPair from '../../assets/brand/deco2.png'

//结算页的真实路由还没定，先集中在这里，确定后只改这一行
const settlePath = (id: number) => `/settle/${id}`

export default function Shell() {
  const navigate = useNavigate()
  const [items, setItems] = useState<MyQuestion[]>([])
  const [total, setTotal] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getMyQuestions()
      .then((data) => {
        if (cancelled) return
        setItems(data.list)
        setTotal(data.total)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : '海螺加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  //一次拉全，本地搜索，不逐字请求
  const kw = keyword.trim()
  const visible = kw ? items.filter((item) => item.description.includes(kw)) : items

    return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1 className={styles.title}>我的海螺</h1>
        <p className={styles.subtitle}>
          一共丢出了 {total} 个海螺（最多保留 20 个）
        </p>
        <img className={styles.decoPair} src={decoPair} alt="" aria-hidden="true" />
      </header>

      <div className={styles.sandTop} aria-hidden="true" />

      <div className={styles.searchBar}>
        <input
          className={styles.search}
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="输入关键词搜索"
          aria-label="搜索我的海螺"
        />
      </div>

      <section className={styles.listArea}>
        {error && <p className={styles.error}>{error}</p>}
        {loading ? (
          <p className={styles.empty}>正在打捞…</p>
        ) : visible.length === 0 ? (
          <p className={styles.empty}>没有找到相关的海螺</p>
        ) : (
          <ul className={styles.list}>
            {visible.map((item) => {
              const settled = item.settled_at !== null
              return (
                <li key={item.id} className={`${styles.card} ${settled ? styles.cardSettled : ''}`}>
                  <p className={styles.cardText}>{item.description}</p>
                  <div className={styles.cardFoot}>
                    <span className={styles.meta}>{item.total_votes} 人已投票</span>
                    <button
                      type="button"
                      className={`${styles.pickButton} ${settled ? styles.settledButton : ''}`}
                      disabled={settled}
                      onClick={() => {
                        if (!settled) navigate(settlePath(item.id))
                      }}
                    >
                      {settled ? '已结算' : '去结算'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className={styles.sandEdge} aria-hidden="true" />
    </div>
  )
}