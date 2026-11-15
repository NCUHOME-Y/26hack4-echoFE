// 争议海螺：最新在上的问题列表
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDebates } from '../../mock/debate'
import type { DebateItem } from '../../mock/debate'
import styles from './index.module.css'
import decoPair from '../../assets/brand/deco2.png'

export default function Debate() {
  const navigate = useNavigate()
  const [items, setItems] = useState<DebateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getDebates()
      .then((list) => {
        if (!cancelled) setItems(list)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : '列表加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1 className={styles.title}>争议海螺</h1>
        <p className={styles.subtitle}>这些难选的问题，你能猜到海螺的想法吗</p>
        <img className={styles.decoPair} src={decoPair} alt="" aria-hidden="true" />
      </header>
      <div className={styles.sandTop} aria-hidden="true" />

      <section className={styles.listArea}>
        {error && <p className={styles.error}>{error}</p>}
        {loading ? (
          <p className={styles.empty}>正在打捞…</p>
        ) : items.length === 0 ? (
          <p className={styles.empty}>海滩上还没有海螺</p>
        ) : (
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.id} className={styles.card}>
                <p className={styles.cardText}>{item.description}</p>
                <div className={styles.cardFoot}>
                  <span className={styles.meta}>{item.picked_count} 人捡起</span>
                  <button
                    type="button"
                    className={styles.pickButton}
                    onClick={() => navigate(`/debate/${item.id}`)}
                  >
                    捡起海螺
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
        <div className={styles.sandEdge} aria-hidden="true" />
    </div>
  )
}