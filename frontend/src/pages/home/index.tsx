import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './index.module.css'
import { getHomeData } from '../../mock/home'
import type { HomeData } from '../../mock/home'

import arrowIcon from '../../assets/home/Vector.png'
import sweepBg from '../../assets/home/bkg.png'
import clipLeft from '../../assets/brand/deco-1.png'
import clipCenter from '../../assets/brand/deco-2.png'
import clipRight from '../../assets/brand/deco-3.png'
import shellLogo from '../../assets/brand/shell.png'
import arrow from '../../assets/home/vector-p.png'
import statsIcon from '../../assets/home/Vector-2.png'


function greeting(d: Date) {
  const h = d.getHours()
  if (h < 5) return '夜深了'
  if (h < 12) return '早上好！'
  if (h < 18) return '下午好！'
  return '晚上好！'
}

function formatDate(d: Date) {
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export default function Home() {
  const [data, setData] = useState<HomeData | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [now] = useState(() => new Date())

  useEffect(() => {
    let alive = true
    getHomeData().then((d) => {
      if (alive) setData(d)
    })
    return () => {
      alive = false
    }
  }, [location.key])

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.greeting}>{greeting(now)}</h1>
        <p className={styles.date}>{formatDate(now)}</p>
        {data && <span className={styles.badge}>今日适合赶海</span>}
      </header>

      <div className={styles.sweepwrap}>
        <img className={styles.sweepBg} src={sweepBg} alt="" aria-hidden="true" />
        
        <img className={styles.clipLeft} src={clipLeft} alt="" aria-hidden="true" />
        <img className={styles.clipCenter} src={clipCenter} alt="" aria-hidden="true" />
        <img className={styles.clipRight} src={clipRight} alt="" aria-hidden="true" />
      
        <div className={styles.topTextWrapper}>
          <h2 className={styles.slogan}>去沙滩上，捡一只海螺</h2>
          <p className={styles.sloganDesc}>随机一个问题，投出你的选择</p>
        </div>
        <div
          className={styles.sweepText}
          onClick={() => navigate('/question')}
          role="button"
          tabIndex={0}
        >
          冲刷<br />海滩
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>
            <img className={styles.sectionArrow} src={arrowIcon} alt="" aria-hidden="true" />
            <span>解答那些有所争议的疑问</span>
           
          </h2>

          <div className={styles.scroller}>
            {!data && <p className={styles.loading}>加载中…</p>}
            {data?.disputes.map((item) => (
              <article
                key={item.id}
                className={styles.disputeCard}
                onClick={() => navigate('/debate')}
              >
                <h3 className={styles.disputeTitle}>{item.title}</h3>
                <img className={styles.disputeShell} src={shellLogo} alt="" aria-hidden="true" />
                <p className={styles.disputeText}>{item.summary}</p>
                <div className={styles.waitingText}>
                  <img className={styles.disputeArrow} src={arrow} alt="" aria-hidden="true" />
                  <p className={styles.disputeMore}>等待你的关键一票</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      
      <div className={styles.statsCard}>
        <h2 className={styles.statsTitle}>
          <img className={styles.statsIcon} src={statsIcon} alt=""/>
          看看今日海螺数据
        </h2>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <p className={styles.statLabel}>投出了</p>
            <p className={styles.statValue}>{data ? data.stats.thrown : '—'}</p>
            <p className={styles.statUnit}>只海螺</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statLabel}>收回了</p>
            <p className={styles.statValue}>{data ? data.stats.returned : '—'}</p>
            <p className={styles.statUnit}>只海螺</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statLabel}>拾起了</p>
            <p className={styles.statValue}>{data ? data.stats.picked : '—'}</p>
            <p className={styles.statUnit}>只海螺</p>
          </div>
        </div>
      </div>
    </div>
  )
}
