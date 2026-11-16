// 选择页面
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './index.module.css'
import decoPair from '../../assets/brand/deco2.png'
import {
  EXP_PER_LEVEL,
  getMe,
  levelInfo,
  getQuestion,
  submitVote,
  recycleLabel,
} from '../../mock/question'
import type { AnswerQuestion } from '../../mock/question'

const LETTERS = ['A', 'B', 'C', 'D']

export default function Answer() {
  const navigate = useNavigate()
  const me = getMe()

  const [question, setQuestion] = useState<AnswerQuestion | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [voted, setVoted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 抽新的随机题
  function loadQuestion() {
    getQuestion().then((q) => {
      setQuestion(q)
      setSelected(null)
      setVoted(false)
    })
  }

  useEffect(() => {
    loadQuestion()
  }, [])

  const exp = question ? question.exp : me.exp
  const { level, progress } = levelInfo(exp)
  const totalVotes = question
    ? question.options.reduce((sum, o) => sum + o.votes, 0)
    : 0

  async function handleVote() {
    if (selected === null || submitting) return
    setSubmitting(true)
    try {
      const updated = await submitVote(selected)
      setQuestion(updated)
      setVoted(true)
    } finally {
      setSubmitting(false)
    }
  }

  // 下一只：新的随机题
  function handleNext() {
    if (submitting) return
    loadQuestion()
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate('/home')}
          aria-label="返回"
        >
          ←
        </button>
        <h1 className={styles.title}>随机海螺</h1>
        <img className={styles.decoPair} src={decoPair} alt="" aria-hidden="true" />
      </header>

      <div className={styles.board}>
        {question && (
          <>
            <div className={styles.expWrap}>
              <span className={styles.level}>lv{level}</span>
              <div className={styles.expBar}>
                <span
                  className={styles.expFill}
                  style={{ width: `${(progress / EXP_PER_LEVEL) * 100}%` }}
                />
              </div>
              <span className={styles.expText}>
                {progress}/{EXP_PER_LEVEL}
              </span>
            </div>

            <section className={styles.card}>
              <p className={styles.question}>{question.title}</p>
              <div className={styles.metaRow}>
                <span className={styles.badge}>{voted ? '已投票' : '投票中'}</span>
              </div>
            </section>
            

            <div className={styles.options}>
              {question.options.map((o, index) => {
                const pct = totalVotes ? Math.round((o.votes / totalVotes) * 100) : 0
                const isMine = selected === o.id
                const className = [
                  styles.option,
                  isMine && !voted ? styles.optionSelected : '',
                  voted && isMine ? styles.optionMine : '',
                ]
                  .filter(Boolean)
                  .join(' ')
                return (
                  <button
                    key={o.id}
                    type="button"
                    className={className}
                    disabled={voted}
                    onClick={() => setSelected(isMine ? null : o.id)}
                  >
                    <span className={styles.letter}>{LETTERS[index]}</span>
                    <span className={styles.optionLabel}>{o.text}</span>
                    {voted && <span className={styles.percent}>{pct}%</span>}
                  </button>
                )
              })}
            </div>

            <p className={styles.expireRow}>
              海螺回收时间：{recycleLabel(question.created_at, question.expires_at)}
            </p>
          </>
        )}
      </div>

      <footer className={styles.sandEdge}>
        {voted ? (
          <button type="button" className={styles.confirm} onClick={handleNext}>
            下一只
          </button>
        ) : (
          <button
            type="button"
            className={styles.confirm}
            disabled={selected === null || submitting}
            onClick={handleVote}
          >
            确认投票
          </button>
        )}
      </footer>
    </div>
  )
}
