import {useEffect,useState} from 'react'
import {useNavigate,useParams} from 'react-router-dom'
import {getDebateDetail} from '../../../mock/debate'
import type {DebateDetail} from '../../../mock/debate'
import styles from './index.module.css'

const LETTERS =['A','B','C','D']

export default function DebateDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<DebateDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // 我猜的选项；null 表示还没猜，猜完就锁定
  const [guessed, setGuessed] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    getDebateDetail(Number(id))
      .then((data) => {
        if (!cancelled) setDetail(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : '详情加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const revealed = guessed !== null
  const finalIndex = detail
    ? detail.options.findIndex((option) => option.id === detail.final_option_id)
    : -1
  const finalOption = finalIndex >= 0 && detail ? detail.options[finalIndex] : null
  const isCorrect = revealed && detail?.final_option_id === guessed

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate(-1)}
          aria-label="返回"
        >
          ←
        </button>
        <h1 className={styles.title}>争议海螺</h1>
      </header>

      <div className={styles.board}>
        {loading && <p className={styles.status}>正在打捞…</p>}
        {error && <p className={styles.error}>{error}</p>}

        {detail && !loading && (
          <>
            <section className={styles.card}>
              <p className={styles.question}>{detail.description}</p>
              <div className={styles.metaRow}>
                <span className={styles.meta}>{detail.total_votes} 人捡起</span>
                <span className={styles.badge}>已结算</span>
              </div>
            </section>

            <p className={styles.hint}>
              {revealed ? '答案已公布' : '猜一个：海螺最后会选哪个？'}
            </p>

            <div className={styles.options}>
              {detail.options.map((option, index) => {
                const isFinal = option.id === detail.final_option_id
                const isMine = option.id === guessed
                const className = [
                  styles.option,
                  revealed && isFinal ? styles.optionFinal : '',
                  revealed && isMine && !isFinal ? styles.optionWrong : '',
                ]
                  .filter(Boolean)
                  .join(' ')
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={className}
                    disabled={revealed}
                    onClick={() => setGuessed(option.id)}
                  >
                    <span className={styles.letter}>{LETTERS[index]}</span>
                    <span className={styles.optionLabel}>{option.label}</span>
                    {revealed && <span className={styles.percent}>{option.percent}%</span>}
                  </button>
                )
              })}
            </div>

            {revealed && (
              <div className={`${styles.result} ${isCorrect ? styles.resultRight : styles.resultWrong}`}>
                <p className={styles.resultTitle}>{isCorrect ? '猜对了' : '猜错了'}</p>
                <p className={styles.resultText}>
                  {finalOption
                    ? `海螺最后选了「${LETTERS[finalIndex]} ${finalOption.label}」，${finalOption.percent}% 的人选了它`
                    : '这道题没有人回答，海螺没有选出答案'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}