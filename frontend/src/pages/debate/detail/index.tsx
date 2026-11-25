import {useEffect,useRef,useState} from 'react'
import {useNavigate,useParams} from 'react-router-dom'
import {
  COMMENT_MAX_LEN,
  addComment,
  deleteComment,
  getComments,
  getQuestionDetail,
} from '../../../api/question'
import type {
  CommentView,
  QuestionDetail,
} from '../../../api/question'
import styles from './index.module.css'
import decoPair from '../../../assets/brand/deco2.png'
import { avatarUrl } from '../../../assets/avatars'

const LETTERS =['A','B','C','D']

export default function DebateDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<QuestionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // 我猜的选项；null 表示还没猜，猜完就锁定
  const [guessed, setGuessed] = useState<number | null>(null)

  // 评论区（猜完之后才出现，和答题页一致）
  const [comments, setComments] = useState<CommentView[]>([])
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState('')
  const [commentError, setCommentError] = useState('')
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const pressTimer = useRef<number | null>(null)

  const qid = Number(id)
  const invalidId = !Number.isInteger(qid) || qid <= 0
  useEffect(() => {
    if (invalidId) return

    let cancelled = false

    getQuestionDetail(qid)
      .then((data) => {
        if (cancelled) return
        setDetail(data)
        setGuessed(null)
        setComments([])
        setDraft('')
        setCommentError('')
        setConfirmId(null)
        setError('')
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '详情加载失败')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [qid, invalidId])

  const displayLoading = invalidId ? false : loading
  const displayError = invalidId ? '这只海螺找不到' : error

  const revealed = guessed !== null
  const finalIndex = detail
    ? detail.options.findIndex((option) => option.id === detail.final_option_id)
    : -1
  const finalOption = finalIndex >= 0 && detail ? detail.options[finalIndex] : null
  const isCorrect = revealed && detail?.final_option_id === guessed

  // 猜完才拉评论区，进评论区取一次快照
  useEffect(() => {
    if (!revealed || !detail) return
    
    let cancelled = false
    
    getComments(detail.id)
      .then((list) => {
        if (!cancelled) setComments(list)
      })
      .catch((err) => {
        if (!cancelled) {
          setCommentError(
            err instanceof Error ? err.message : '评论加载失败',
          )
        }
      })
    
    return () => {
      cancelled = true
    }
  }, [revealed, detail])

  async function handleSend() {
    if (!detail || !draft.trim() || sending) return
    setSending(true)
    try {
      const list = await addComment(detail.id, draft)
      setComments(list)
      setDraft('')
      setCommentError('')
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : '发送失败')
    } finally {
      setSending(false)
    }
  }

  async function handleDelete(commentId: number) {
    if (!detail) return
    try {
      const list = await deleteComment(detail.id, commentId)
      setComments(list)
      setConfirmId(null)
      setCommentError('')
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : '删除失败')
      setConfirmId(null)
    }
  }

  // 长按自己发的评论，弹删除确认框
  function startPress(commentId: number) {
    if (pressTimer.current) clearTimeout(pressTimer.current)
    pressTimer.current = window.setTimeout(() => setConfirmId(commentId), 500)
  }

  function cancelPress() {
    if (pressTimer.current) clearTimeout(pressTimer.current)
  }

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
        <img className={styles.decoPair} src={decoPair} alt="" aria-hidden="true" />
      </header>

      <div className={styles.board}>
        {displayLoading && <p className={styles.status}>正在打捞…</p>}
        {!displayLoading && displayError && (
          <p className={styles.error}>{displayError}</p>
        )}
        
        {detail && !displayLoading && !displayError && (
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

            {/* 评论区 */}
            {revealed && (
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
                          if (c.is_mine === true) startPress(c.id)
                        }}
                        onPointerUp={cancelPress}
                        onPointerLeave={cancelPress}
                        onPointerCancel={cancelPress}
                      >
                        <img
                          className={styles.commentAvatar}
                          src={avatarUrl(c.author.avatar)}
                          alt=""
                        />

                        <div className={styles.commentBody}>
                          <div className={styles.commentMeta}>
                            <span className={styles.commentName}>{c.author.nickname}</span>
                            <span className={styles.commentLevel}>lv{c.author.level}</span>
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
                    disabled={!draft.trim() || sending}
                    onClick={handleSend}
                  >
                    {sending ? '发送中…' : '发送'}
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

      {/* 删除评论确认框 */}
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