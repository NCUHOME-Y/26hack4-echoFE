// 作答者结算页
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './index.module.css'
import decoPair from '../../../assets/brand/deco2.png'
import {
  COMMENT_MAX_LEN,
  getQuestionDetail,
  getComments,
  addComment,
  deleteComment,
} from '../../../api/question'
import type {
  QuestionDetail,
  CommentView,
} from '../../../api/question'
import { avatarUrl } from '../../../assets/avatars'

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

export default function AnswerEnd() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [question, setQuestion] = useState<QuestionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        setError('')
        setQuestion(data)
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
  const total = question?.total_votes ?? 0
  const expired = question
    ? question.status === 'closed' && !settled
    : false

// 积分
  const EXP_SETTLE_MATCH = 25  
  const EXP_SETTLE_MISS = 5    
  const EXP_SETTLE_FAILED = 15  
  const mySettleExp =
     question && settled && question.my_vote
      ? question.final_option_id === null
        ? EXP_SETTLE_FAILED
        : question.my_vote.option_id === question.final_option_id
          ? EXP_SETTLE_MATCH
          : EXP_SETTLE_MISS
      : 0

  const displayLoading = invalidId ? false : loading
  const displayError = invalidId ? '这只海螺找不到' : error

  useEffect(() => {
    if (!question) return
    let cancelled = false
    getComments(question.id).then((list) => {
      if (!cancelled) setComments(list)
    })
    return () => {
      cancelled = true
    }
  }, [question])

 
  async function handleSend() {
    if (!question || !draft.trim() || sending) return
    setSending(true)
    try {
      const list = await addComment(question.id, draft)
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

  // 只有自己发的评论能长按删除
  function startPress(mine: boolean, commentId: number) {
    if (!mine) return
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
          onClick={() => navigate('/profile')}
          aria-label="返回我的"
        >
          ←
        </button>
        <h1 className={styles.title}>我的回答</h1>
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
              <div className={styles.metaRow}>
                <span className={styles.badge}>{settled ? '已结算' : '未结算'}</span>
              </div>
              <p className={styles.cardFoot}>一共 {total} 人作答</p>
            </section>

            {/* 各选项占比 */}
            <div className={styles.options}>
              {question.options.map((opt, index) => {
                const isMine = opt.id === question.my_vote?.option_id
                const isFinal = question.final_option_id === opt.id
                const className = [
                  styles.option,
                  isMine ? styles.optionMine : '',
                  isFinal ? styles.optionFinal : '',
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <div key={opt.id} className={className}>
                    <span className={styles.letter}>{LETTERS[index]}</span>
                    <span className={styles.optionLabel}>
                      {opt.label}
                      {isMine && <em className={styles.tagMine}>我的选择</em>}
                      {isFinal && <em className={styles.tagFinal}>最终选择</em>}
                    </span>
                    <span className={styles.votes}>{opt.votes} 人</span>
                    <span className={styles.percent}>{opt.percent}%</span>
                  </div>
                )
              })}
            </div>

            {/* 结算 */}
            <section className={styles.verdict}>
              <p className={styles.verdictTitle}>海螺最终的真实选择：</p>
              <p className={styles.verdictText}>
                {!settled
                  ? expired
                    ? `海螺已在${expireLabel(question.expires_at).replaceAll(' ', '')}被收回。`
                    : `海螺将在${expireLabel(question.expires_at).replaceAll(' ', '')}被收回。`
                  : question.final_option_id === null
                    ? <>
                    这只海螺已经沉入深海，
                    { question.my_vote&& (
                      <span className={styles.gainInline}>
                      已经给您补偿了{EXP_SETTLE_FAILED}积分
                      </span>
                     )}
                     </>
                    : (question.options.find((o) => o.id === question.final_option_id)?.label ??
                      '没有公布')}
              </p>

              
              {settled && question.final_option_id !== null && question.my_vote && (
                <p className={styles.gain}>
                  {question.my_vote.option_id === question.final_option_id
                    ? `猜中发布者的选择，获得${mySettleExp}积分`
                    : `投出这一票获得${mySettleExp}积分`}
                </p>
              )}

            </section>

            {/* 评论区：投票后能看 */}
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
                        onPointerDown={() => startPress(c.is_mine, c.id)}
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
