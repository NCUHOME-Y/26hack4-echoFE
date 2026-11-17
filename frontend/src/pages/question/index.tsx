// 答题页
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './index.module.css'
import decoPair from '../../assets/brand/deco2.png'
import { EXP_PER_LEVEL, getMe } from '../../api/me'
import type { MeProfile } from '../../api/me'
import {
  COMMENT_MAX_LEN,
  getRandomQuestion,
  submitVote,
  getComments,
  addComment,
  deleteComment,
} from '../../api/question'
import type {
  QuestionDetail,
  CommentView,
} from '../../api/question'
import { recycleLabel } from '../../mock/question'
import { avatarUrl } from '../../assets/avatars'

const LETTERS = ['A', 'B', 'C', 'D']
const MAX_LEVEL = 9999

export default function Answer() {
  const navigate = useNavigate()

  const [me, setMe] = useState<MeProfile | null>(null)
  const [question, setQuestion] = useState<QuestionDetail | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [voted, setVoted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [empty, setEmpty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [comments, setComments] = useState<CommentView[]>([])
  const [draft, setDraft] = useState('')
  const [commentError, setCommentError] = useState('')
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const pressTimer = useRef<number | null>(null)

function loadQuestion() {
  Promise.all([getRandomQuestion(), getMe()])
    .then(([q, profile]) => {
      setMe(profile)
      setLoadError('')

      if (!q) {
        setQuestion(null)
        setEmpty(true)
        return
      }

      setQuestion(q)
      setEmpty(false)
      setSelected(null)
      setVoted(false)
      setComments([])
      setDraft('')
      setCommentError('')
      setConfirmId(null)
    })
    .catch((err) => {
      setQuestion(null)
      setLoadError(err instanceof Error ? err.message : '题目加载失败')
    })
    .finally(() => {
      setLoading(false)
    })
}

  useEffect(() => {
    loadQuestion()
  }, [])

  useEffect(() => {
    if (!voted || !question) return
    getComments(question.id)
      .then(setComments)
      .catch((err) => {
        setCommentError(
          err instanceof Error ? err.message : '评论加载失败',
        )
    })  
  }, [voted, question])

  const level = me?.level ?? 0
  const progress = me?.level_progress ?? 0

  async function handleVote() {
    if (!question || selected === null || submitting) return

    setSubmitting(true)
    setLoadError('')

    try {
      const updated = await submitVote(question.id, selected)

      setQuestion({
        ...question,
        options: updated.options,
        total_votes: updated.total_votes,
      })
      setVoted(true)

      // 投票成功固定增加 5 经验，本地更新当前页面的经验快照
      setMe((current) => {
        if (!current) return current

        const exp = current.exp + 5
        const nextLevel = Math.min(
          Math.floor(exp / EXP_PER_LEVEL),
          MAX_LEVEL,
        )

        return {
          ...current,
          exp,
          level: nextLevel,
          level_progress:
            nextLevel === MAX_LEVEL ? 0 : exp % EXP_PER_LEVEL,
        }
      })
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : '投票失败')
    } finally {
      setSubmitting(false)
    }
  }

  function handleNext() {
    if (submitting) return

    setLoading(true)
    setLoadError('')
    setEmpty(false)
    setQuestion(null)
    setVoted(false)
    loadQuestion()
  }

  // 发评论
  async function handleSend() {
    if (!question || !draft.trim()) return
    try {
      const list = await addComment(question.id, draft)
      setComments(list)
      setDraft('')
      setCommentError('')
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : '发送失败')
    }
  }

  async function handleDelete(commentId: number) {
    if (!question) return
    try {
      const list = await deleteComment(question.id, commentId)
      setComments(list)
      setConfirmId(null)
      setCommentError('')
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : '删除失败')
      setConfirmId(null)
    }
  }

  // 长按弹出删除评论确认框
  function startPress(commentId: number) {
    if (pressTimer.current) clearTimeout(pressTimer.current)
    pressTimer.current = window.setTimeout(() => setConfirmId(commentId), 500)
  }

  function cancelPress() {
    if (pressTimer.current) clearTimeout(pressTimer.current)
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate('/home')}
          aria-label="返回"
        >
          ←
        </button>
        <h1 className={styles.title}>随机海螺</h1>

        {/* 投票确认后下一只 */}
        {!empty && voted && (
          <button
            type="button"
            className={styles.nextBtn}
            disabled={submitting}
            onClick={handleNext}
          >
            下一只
          </button>
        )}

        <img className={styles.decoPair} src={decoPair} alt="" aria-hidden="true" />
      </header>

      <div className={styles.board}>
        {loading && <p className={styles.emptyText}>正在捡海螺…</p>}
        {loadError && <p className={styles.emptyText}>{loadError}</p>}
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
              <p className={styles.question}>{question.description}</p>
              <div className={styles.metaRow}>
                <span className={styles.badge}>{voted ? '已投票' : '投票中'}</span>
              </div>
            </section>

            <div className={styles.options}>
              {question.options.map((o, index) => {
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
                    <span className={styles.optionLabel}>{o.label}</span>
                    {voted && <span className={styles.percent}>{o.percent}%</span>}
                  </button>
                )
              })}
              </div>

            {!voted && (
              <p className={styles.expireRow}>
                海螺回收时间：{recycleLabel(question.created_at, question.expires_at)}
              </p>
            )}

            {voted && (
              <section className={styles.verdict}>
                <p className={styles.verdictTitle}>海螺最终的真实选择：</p>
                <p className={styles.verdictText}>
                  海螺将在{recycleLabel(question.created_at, question.expires_at)}被收回。
                </p>
              </section>
            )}

            {/* 评论区 */}
            {voted && (
              <section className={styles.comments}>
                <div className={styles.commentHead}>
                  <h2 className={styles.commentTitle}>大家怎么说</h2>
                  <span className={styles.commentCount}>共 {comments.length} 条评论</span>
                </div>

                {comments.length === 0 ? (
                  <p className={styles.commentEmpty}>这只海螺期待听到你的想法</p>
                ) : (
                  <ul className={styles.commentList}>
                    {comments.map((c) => (
                      <li
                        key={c.id}
                        className={styles.comment}
                        onPointerDown={() => {
                          if (c.is_mine || question.asker.id === me?.id) startPress(c.id)
                        }}
                        onPointerUp={cancelPress}
                        onPointerLeave={cancelPress}
                        onPointerCancel={cancelPress}
                      >
                        {/* 匿名 */}
                        <img
                          className={styles.commentAvatar}
                          src={avatarUrl(c.author.avatar)}
                          alt=""
                        />

                        <div className={styles.commentBody}>
                          <div className={styles.commentMeta}>
                            <span className={styles.commentName}>匿名海螺</span>
                            {/* 审核 */}
                            <span className={styles.commentLevel}>
                              lv{c.author.level}
                            </span>
                          </div>
                          <p className={styles.commentText}>{c.content}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className={styles.commentEditor}>
                  <input
                    className={styles.commentInput}
                    value={draft}
                    maxLength={COMMENT_MAX_LEN}
                    placeholder="说点什么…"
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.sendBtn}
                    disabled={!draft.trim()}
                    onClick={handleSend}
                  >
                    发送
                  </button>
                </div>

                <p className={styles.counter}>
                  {draft.length}/{COMMENT_MAX_LEN}
                </p>
                {commentError && <p className={styles.commentError}>{commentError}</p>}
              </section>
            )}
          </>
        )}
      </div>

      {/* 投票按钮 */}
      {question&&!empty && !voted && (
        <footer className={styles.sandEdge}>
          <button
            type="button"
            className={styles.confirm}
            disabled={selected === null || submitting}
            onClick={handleVote}
          >
            确认投票
          </button>
        </footer>
      )}

      {/* 海螺空态 */}
      {empty && (
        <div className={styles.emptyBox}>
          <p className={styles.emptyText}>海里已经没有海螺了</p>
        </div>
      )}

      {/* 删除评论 */}
      {confirmId !== null && (
        <div className={styles.confirmMask}>
          <div className={styles.confirmBox}>
            <p className={styles.confirmText}>确定删除评论吗</p>
            <div className={styles.confirmDivider} />
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setConfirmId(null)}
              >
                取消
              </button>
              <button
                type="button"
                className={styles.dangerBtn}
                onClick={() => handleDelete(confirmId)}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
