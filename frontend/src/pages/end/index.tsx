// 发布者结算页
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './index.module.css'
import decoPair from '../../assets/brand/deco2.png'
import cryImg from '../../assets/brand/cry.png'
import timeIcon from '../../assets/brand/time.png'
import {
  COMMENT_MAX_LEN,
  getQuestionDetail,
  settleQuestion,
  getComments,
  addComment,
  deleteComment,
} from '../../api/question'
import type {
  QuestionDetail,
  CommentView,
} from '../../api/question'
import { avatarUrl } from '../../assets/avatars'

const LETTERS = ['A', 'B', 'C', 'D']

function expireLabel(iso: string, now = Date.now()): string {
  const diff = new Date(iso).getTime() - now
  const past = diff < 0
  const mins = Math.round(Math.abs(diff) / 60000)

  if (mins <= 1) return past ? '刚刚' : '1 分钟后'
  if (mins < 60) return past ? `${mins} 分钟前` : `${mins} 分钟后`

  const hours = Math.round(mins / 60)
  if (hours < 24) return past ? `${hours} 小时前` : `${hours} 小时后`

  const days = Math.round(hours / 24)
  return past ? `${days} 天前` : `${days} 天后`
}

export default function End() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [question, setQuestion] = useState<QuestionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [picked, setPicked] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [comments, setComments] = useState<CommentView[]>([])
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
          setError('')
          setQuestion(data)
          setPicked(data.final_option_id)
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : '海螺打捞失败')
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
      
      return () => {
        cancelled = true
      }
    }, [qid, invalidId])

    const settled = question?.settled_at != null
    const hasVotes = (question?.total_votes ?? 0) > 0
    const total = question?.total_votes ?? 0
    const expired = question?.status === 'closed'

    const displayLoading = invalidId ? false : loading
    const displayError = invalidId ? '这只海螺找不到' : error
  
  useEffect(() => {
    if (!question || !hasVotes) return
    let cancelled = false
    getComments(question.id).then((list) => {
      if (!cancelled) setComments(list)
    })
    return () => {
      cancelled = true
    }
  }, [question, hasVotes])

  

  async function handleSettle() {
    if (!question || picked === null || submitting) return
     
    setSubmitting(true)
     
    try {
      const next = await settleQuestion(question.id, picked)
      setQuestion(next)
      setPicked(next.final_option_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : '收回失败')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSend() {
    if (!question) return
    const text = draft.trim()
    if (!text) return
    try {
      // 发问者视角
      const list = await addComment(question.id, text)
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
          onClick={() => navigate('/shell')}
          aria-label="返回我的海螺"
        >
          ←
        </button>
        <h1 className={styles.title}>我的海螺</h1>
        <img className={styles.decoPair} src={decoPair} alt="" aria-hidden="true" />
      </header>

      <div className={styles.board}>
        {displayLoading && (
          <p className={styles.hint}>正在打捞这只海螺…</p>
        )}
        {!displayLoading && displayError && (
          <p className={styles.hint}>{displayError}</p>
        )}
        
        {!displayLoading && !displayError && question && (
          <>
            <section className={styles.card}>
              <p className={styles.question}>{question.description}</p>
              {settled && (
                <div className={styles.metaRow}>
                  <span className={styles.badge}>已结算</span>
                </div>
              )}
              <p className={styles.cardFoot}>
                {hasVotes
                  ? `已经有 ${total} 人捡起了你的海螺`
                  : '这只海螺还没有被谁捡起过'}
              </p>
            </section>

            {/* 没人作答空态 */}
            {!hasVotes && expired && (
              <section className={styles.emptyCard}>
                <p className={styles.emptyTitle}>好可惜</p>
                <p className={styles.emptyTitle}>居然没有人捡起这颗海螺…</p>
                <img className={styles.cry} src={cryImg} alt="" />
                <p className={styles.emptyFoot}>大家只是没有发现这只海螺</p>
                <p className={styles.emptyFoot}>再丢一次吧</p>
              </section>
            )}

            {!hasVotes && !expired && (
              <section className={styles.emptyCard}>
                <p className={styles.emptyTitle}>这颗海螺还在海里漂着</p>
                <p className={styles.emptyFoot}>
                  还没有人捡起它，{expireLabel(question.expires_at)}截止，再回来看看
                </p>
              </section>
            )}

            {/* 有人作答 */}
            {hasVotes && (
              <div className={styles.options}>
                {question.options.map((opt, index) => {
                  const isPicked = picked === opt.id
                  const isFinal =
                    settled && question.final_option_id === opt.id

                  const className = [
                    styles.option,
                    !settled && isPicked ? styles.optionSelected : '',
                    isFinal ? styles.optionFinal : '',
                  ]
                    .filter(Boolean)
                    .join(' ')

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={className}
                      disabled={settled}
                      onClick={() => setPicked(opt.id)}
                    >
                      <span className={styles.letter}>{LETTERS[index]}</span>
                      <span className={styles.optionLabel}>
                        {opt.label}
                        {isFinal && <em className={styles.tag}>最终选择</em>}
                      </span>
                      <span className={styles.votes}>{opt.votes} 人</span>
                      <span className={styles.percent}>{opt.percent}%</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* 收回区：紧跟选项白卡下面（公布后不出现） */}
            {!settled && hasVotes && (
              <section className={styles.sandEdge}>
                <div className={styles.expirePill}>
                  <img className={styles.pillIcon} src={timeIcon} alt="" />
                  <span className={styles.pillText}>
                    <span className={styles.pillLabel}>
                      {expired ? '已截止于:' : '截止时间:'}
                    </span>
                    <span className={styles.pillValue}>{expireLabel(question.expires_at)}</span>
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.settleBtn}
                  disabled={submitting || (picked === null)}
                  onClick={handleSettle}
                >
                  {submitting ? '收回中…' : '收回海螺'}
                </button>
              </section>
            )}

            {/* 公布结果 */}
            {settled && (
              <section className={styles.verdict}>
                <div className={styles.verdictHead}>
                  <p className={styles.verdictTitle}>
                    {hasVotes ? '海螺最终的真实选择：' : '这颗海螺已经收回了'}
                  </p>
                  <div className={styles.expirePill}>
                    <img className={styles.pillIcon} src={timeIcon} alt="" />
                    <span className={styles.pillText}>
                      <span className={styles.pillLabel}>
                        {expired ? '已截止于:' : '截止时间:'}
                      </span>
                      <span className={styles.pillValue}>
                        {expireLabel(question.expires_at)}
                      </span>
                    </span>
                  </div>
                </div>
                <p className={styles.verdictText}>
                  {hasVotes
                    ? (question.options.find(
                        (option) => option.id === question.final_option_id,
                      )?.label ?? '没有公布')
                    : '下次丢出去，也许就有人捡到了。'}
                </p>
              </section>
            )}

            {/* 评论区 */}
            {hasVotes && (
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
                        onPointerDown={() => startPress(c.id)}
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
                            <span className={styles.commentName}>匿名海螺</span>
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
